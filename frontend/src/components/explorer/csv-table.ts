import { LitElement, html, css, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { customElement, property } from 'lit/decorators.js';


@customElement('csv-table')
class CsvTable extends LitElement {
  static styles = css`
    .pagination {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      padding: 10px 5px;
      gap: 5px;
      background: white;
      z-index: 1;
    }

    .table-container {
      width: 100%;
      height: 500px;
      overflow: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      padding: 10px;
      text-align: left;
      border: 1px solid #ddd;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    td {
      padding: 10px;
      text-align: left;
      border: 1px solid #ddd;
      white-space: wrap;
    }

    thead th {
      position: sticky;
      top: 0;
      background-color: #f1f1f1;
      z-index: 1;
    }

    .button {
      display: inline-block;
      width: 24px;
      height: 24px;
      border: none;
      background-color: transparent;
      position: relative;
    }

    .button::before {
      content: '';
      display: block;
      width: 5px;
      height: 5px;
      border-style: solid;
      border-width: 2px 2px 0 0;
      position: absolute;
      top: 50%;
      left: 50%;
      transform-origin: center;
    }

    .prev-button::before {
      transform: translate(-50%, -50%) rotate(-135deg);
    }

    .next-button::before {
      transform: translate(-50%, -50%) rotate(45deg);
    }

    .button:hover {
      cursor: pointer;
      background-color: #f0f0f0;
      border-radius: 50%;
    }

    .button.disabled {
      pointer-events: none;
      cursor: default;
      opacity: 0.8;
    }

  `;

  @property({ type: Object })
  data: ExplorerData;

  @property({ type: Number })
  skip: number = 0;

  @property({ type: Number })
  limit: number = 10;

  private getHeaderRow() {
    if (!this.data?.rows || !this.data?.rows[0]) {
      return nothing;
    }
    return html`
      <tr>
        <th>Row Number</th>
        ${this.data.rows[0].columns.map((column: CsvColumn) => html`
          <th title="${column.header}">${column.header}</th>`)}
      </tr>
    `;
  }

  private getTableRow(row: CsvRow) {
    const columns = row.columns;
    return html`
      <tr>
        <td title="${row.row_number}">${row.row_number}</td>
        ${row.columns.map((column: CsvColumn) => html`
          <td title="${column.input_value}">${column.input_value}</td>`)}
      </tr>
    `;
  }

  private getPreviousPage() {
    const newSkip = this.skip - this.limit;
    if (newSkip >= 0) {
      this.dispatchEvent(new CustomEvent('page-change', { detail: { skip: newSkip, limit: this.limit } }));
    }
  }

  private getNextPage() {
    const newSkip = this.skip + this.limit;
    if (newSkip < this.data.rows_count) {
      this.dispatchEvent(new CustomEvent('page-change', { detail: { skip: newSkip, limit: this.limit } }));
    }
  }

  private getTotalPagesNumber() {
    return this.data?.rows_count
      ? Math.ceil(this.data.rows_count / this.limit)
      : 0;
  }

  private getCurrentPage() {
    return this.data?.rows_count
      ? Math.floor(this.skip / this.limit) + 1
      : 0;
  }

  private nextButtonDisabled() {
    return !this.data?.rows_count || this.skip + this.limit >= this.data.rows_count;
  }

  render() {
    return html`
      <div>
        <div class="pagination">
          <div title="Previous Page"
               class="button prev-button ${classMap({ disabled: this.skip === 0 })}"
               @click="${this.getPreviousPage}"
               aria-label="Previous page"
          >
          </div>

          <span>${this.getCurrentPage()}</span>
          <span>/</span>
          <span>${this.getTotalPagesNumber()}</span>

          <div title="Next Page"
               class="button next-button ${classMap({ disabled: this.nextButtonDisabled() })}"
               @click="${this.getNextPage}"
               aria-label="Next page"
          >
          </div>
        </div>

        <div class="table-container">
          <table>
            <thead>${this.getHeaderRow()}</thead>
            <tbody>${this.data?.rows.map(row => this.getTableRow(row))}</tbody>
          </table>
        </div>
      </div>
    `;
  }
}
