interface CsvColumn {
  index: number;
  header: string;
  input_value: string
}

type CsvRow = {
  row_number: number;
  columns: Array<CsvColumn>
}

interface ExplorerData {
  skip: number;
  limit: number;
  rows: Array<CsvRow>;
  rows_count: number;
}

interface ValueCountsData {
  [key: string]: {
    column_index: number;
    value_counts: { [key: string]: number };
  };
}

interface MissingValuesData {
  [key: string]: {
    column_index: number;
    missing_percentage: number;
  };
}

interface InsightsData {
  meta_value_counts: ValueCountsData,
  missing_values: MissingValuesData
}