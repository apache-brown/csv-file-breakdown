from typing import Dict, Any

import pandas as pd


def get_csv_config(df: pd.DataFrame) -> Dict[str, Dict[str, Any]]:
    column_info = {}

    for idx, col in enumerate(df.columns):
        unique_values = df[col].nunique(dropna=True)
        empty_values_count = df[col].isna().sum()

        if unique_values <= 1:
            col_type = 'ignore'
        elif unique_values < 10:
            col_type = 'meta'
        else:
            col_type = 'data'

        column_info[col] = {
            'index': idx,
            'empty_values_count': int(empty_values_count),
            'type': col_type
        }

    return column_info

def get_csv_insights_from_file(path: str) -> Dict[str, Dict[str, Any]]:
    df = pd.read_csv(path)
    df.replace(to_replace="^\s+$", value=pd.NA, inplace=True)

    csv_config = get_csv_config(df)

    df.fillna("no_value", inplace=True)

    missing_values_percentage = {
        col: {
            'column_index': info['index'],
            'empty_values_percentage': (info['empty_values_count'] / len(df)) * 100
        }
        for col, info in csv_config.items()
    }

    meta_value_counts = {}
    for col, info in csv_config.items():
        if info['type'] == 'meta':
            value_counts = df[col].value_counts(dropna=True).to_dict()
            meta_value_counts[col] = {
                'column_index': info['index'],
                'value_counts': value_counts
            }

    missing_values_data = {
        col: {**details}

        for col, details in missing_values_percentage.items()
    }

    meta_value_counts_data = {
        col: {
            'column_index': data['column_index'],
            'value_counts': data['value_counts']
        }

        for col, data in meta_value_counts.items()
    }

    return {
        "missing_values": missing_values_data,
        "meta_value_counts": meta_value_counts_data
    }
