from os import environ
from pathlib import Path
from datetime import datetime

import pandas as pd

from bson import ObjectId
from bson.errors import InvalidId

from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware

from openai import OpenAI

from utils import get_csv_config
from db import db_csv_files, db_csv_file_rows

from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"status": "ok", "message": '"Howdy from a "Csv Breakdown Api"'}


@app.post("/files/upload")
def upload_file(file: UploadFile = File(...)):
    if file.content_type != "text/csv":
        raise HTTPException(403, detail="Only csv files are supported")

    df = pd.read_csv(file.file, dtype=str)

    file.file.close()

    df.replace(to_replace="^\s+$", value=pd.NA, inplace=True)

    columns_config = get_csv_config(df)

    df.fillna("no_value", inplace=True)

    file_to_insert = {
        "filename": file.filename,
        "rows_count": df.shape[0],
        "columns_config": columns_config,
        "uploaded_at": datetime.now(),
    }

    file_id = db_csv_files.insert_one(file_to_insert).inserted_id

    rows_to_insert = []

    for row_number, row in enumerate(df.to_dict("records"), start=1):

        columns = []
        for idx, items in enumerate(row.items()):
            header, value = items

            columns.append({
                "index": idx,
                "type": columns_config[header]["type"],
                "header": header,
                "input_value": value
            })

        rows_to_insert.append({
            "file_id": file_id,
            "row_number": row_number,
            "columns": columns,
        })

    db_csv_file_rows.insert_many(rows_to_insert)

    return {"status": "ok", "data": {**file_to_insert, "_id": str(file_id)}}


@app.get("/files/list")
def get_files():
    files_cursor = db_csv_files.find(projection={"file_id": 1, "filename": 1, "columns_config": 1})

    file_list = [{**file, "_id": str(file["_id"])} for file in files_cursor]

    return {"status": "ok", "data": file_list}


@app.delete("/files/{file_id}")
def delete_file(file_id: str):
    try:
        file_id = ObjectId(file_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid file id")

    db_csv_files.delete_one({"_id": file_id})
    db_csv_file_rows.delete_many({"file_id": file_id})

    return {"status": "ok"}


@app.get("/files/{file_id}/rows")
def get_file_rows(file_id: str, skip: int = 0, limit: int = 10):
    try:
        file_id = ObjectId(file_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid file id")

    rows_total = db_csv_file_rows.count_documents({"file_id": file_id})
    rows = db_csv_file_rows.find({"file_id": file_id}, {"_id": 0, "file_id": 0}).skip(skip).limit(limit)

    result = {
        "skip": skip,
        "limit": limit,
        "rows": list(rows),
        "rows_count": rows_total,
    }

    return {"status": "ok", "data": result}


@app.get("/files/{file_id}/insights")
def get_file_insights(file_id: str):
    try:
        file_id = ObjectId(file_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid file id")

    if not db_csv_files.count_documents({"_id": file_id}):
        raise HTTPException(404, detail="File not found")

    file = db_csv_files.find_one({"_id": file_id})

    config_aggregate = db_csv_file_rows.aggregate([
        {"$match": {"file_id": file_id}},
        {"$unwind": "$columns"},
        {"$match": {"columns.type": "meta"}},
        {"$group": {
            "_id": {
                "header": "$columns.header",
                "input_value": "$columns.input_value"
            },
            "count": {"$sum": 1},
            "index": {"$first": "$columns.index"},
        }},
        {"$group": {
            "_id": "$_id.header",
            "values_count": {
                "$push": {
                    "value": "$_id.input_value",
                    "count": "$count"
                }
            },
            "index": {"$first": "$index"}
        }},
        {"$project": {
            "_id": 0,
            "index": 1,
            "header": "$_id",
            "values_count": 1,
        }}
    ])

    empty_values_by_column = {}
    for column_header, column_config in file["columns_config"].items():
        empty_values_by_column[column_header] = {
            "column_index": column_config["index"],
            "empty_values_percentage": (column_config["empty_values_count"] / file["rows_count"]) * 100,
        }

    meta_columns_breakdown = {}
    for column in config_aggregate:
        meta_columns_breakdown[column["header"]] = {
            "column_index": column["index"],
            "value_counts": {val["value"]: val["count"] for val in column["values_count"]},
        }

    result = {
        "missing_values": empty_values_by_column,
        "meta_value_counts": meta_columns_breakdown
    }

    return {"status": "ok", "data": result}


@app.post("/ask-gpt")
def ask_gpt(file_id: str = Body(), column_name: str = Body()):
    try:
        file_id = ObjectId(file_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid file id")

    if not db_csv_files.count_documents({"_id": file_id}):
        raise HTTPException(404, detail="File not found")

    file = db_csv_files.find_one({"_id": file_id})
    rest_meta_columns = [col_name for col_name, col_config in file["columns_config"].items()
                         if col_name != column_name and col_config["type"] == "meta"]

    column_values_aggregate = list(db_csv_file_rows.aggregate([
        {"$match": {"file_id": file_id}},
        {"$unwind": "$columns"},
        {"$match": {"columns.type": "meta", "columns.header": column_name}},
        {"$group": {
            "_id": {
                "header": "$columns.header",
                "input_value": "$columns.input_value"
            },
            "count": {"$sum": 1},
        }},
        {"$group": {
            "_id": "$_id.header",
            "values_count": {
                "$push": {
                    "value": "$_id.input_value",
                    "count": "$count"
                }
            },
        }},
        {"$project": {
            "_id": 0,
            "values_count": 1,
        }}
    ]))

    if not len(column_values_aggregate):
        raise HTTPException(status_code=404, detail=f"Column '{column_name}' not found")

    data = column_values_aggregate[0]["values_count"]

    string_counts = "\n".join(f"'{value['value']}': total occurrence in file: {value['count']}" for value in data)

    client = OpenAI()

    system_message = """You will be provided with csv file meta data that includes: filename, a meta column name and count of each unique value of that column across whole file.
You need to provide meaningful information about the contents of the file and how the provided meta data can be used to get data insights.
Your answer must be short but meaningful. Don't repeat the question but provide the answer.
    """

    prompt_message = f"""I have a '{file['filename']}' file, containing {file['rows_count']} rows.
Here is on of the 'meta' columns called: '{column_name}', containing next unique values: \n{string_counts}\n
Also consider the rest of meta columns tha names of which are: {', '.join(rest_meta_columns)}.
Based on given information provide insights of that file and ideas on how can use this metrics for further analysis."""

    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": system_message
            },
            {
                "role": "user",
                "content": prompt_message
            }
        ]
    )

    completion_message = completion.choices[0].message

    return {"status": "ok", "data": completion_message.content}
