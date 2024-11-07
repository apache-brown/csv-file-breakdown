interface ColumnsConfig {
  [key: string]: {
    type: string
  }
}

interface CsvFile {
  _id: string
  filename: string,
  columns_config: ColumnsConfig,
  rows_count: number
}