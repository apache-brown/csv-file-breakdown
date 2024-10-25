import pymongo


client = pymongo.MongoClient("localhost", 27017)

db = client["csv_breakdown_db"]
db_csv_files = db["csv_files"]
db_csv_file_rows = db["csv_file_rows"]