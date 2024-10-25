import Chart from 'chart.js/auto';

import { LitElement, html, css, PropertyValues } from 'lit';
import { property, customElement, query } from 'lit/decorators.js';

import { ChartInstance } from '../../types/insights';

@customElement('pie-chart')
class PieChart extends LitElement {
  @property({ type: Object })
  data: ValueCountsData | null = null;

  @property({ type: String })
  selectedColumn: string | null = null;

  @query('#pie-chart-canvas')
  canvas!: HTMLCanvasElement;

  @query('#select-column')
  selectColumnInput!: HTMLSelectElement;

  private chart: ChartInstance | null = null;

  static styles = css`
    canvas {
      width: 100%;
      height: 100%;
    }

    h4 {
      margin: 5px 0;
    }

    .chart-container {
      display: flex;
      flex-direction: column;
      width: 400px;
      height: 400px;
      align-items: center;
    }

    select {
      margin-bottom: 10px;
      padding: 5px 12px;
      font-size: 14px;
      border: 1px solid #ccc;
      border-radius: 5px;
      background-color: #f9f9f9;
      color: #2c5060;
      outline: none;
      transition: border-color 0.3s, box-shadow 0.3s;
    }

    select:focus {
      border-color: #2c5060;
      box-shadow: 0 0 5px rgba(44, 80, 96, 0.5);
    }

    select:hover {
      box-shadow: 0 0 5px rgba(44, 80, 96, 0.5);
    }

    .placeholder {
      text-align: center;
      color: #888;
      font-size: 1.2em;
    }
  `;

  protected firstUpdated() {
    this.createChart();
  }

  protected updated(_changedProperties: PropertyValues) {
    if (_changedProperties.has('selectedColumn') || _changedProperties.has('data')) {
      this.updateChart();
    }
    if (this.selectColumnInput && this.selectColumnInput.value !== this.selectedColumn) {
      this.selectedColumn = this.selectColumnInput.value;
      this.requestUpdate();
    }
  }

  createChart() {
    if (!this.data || !this.selectedColumn || !this.data[this.selectedColumn]) {
      return;
    }

    const ctx = this.canvas.getContext('2d');
    const labels = Object.keys(this.data[this.selectedColumn].value_counts);
    const values = Object.values(this.data[this.selectedColumn].value_counts);

    this.chart = new Chart<'pie', number[], string>(ctx!, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          label: `Count`,
          data: values,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          }
        }
      }
    });
  }

  updateChart() {
    if (this.chart) {
      this.chart.destroy();
    }
    if (this.data && this.selectedColumn) {
      this.createChart();
    }
  }

  handleColumnChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedColumn = selectElement.value;
  }

  render() {
    return html`
      <div class="chart-container">
        <h4>Meta Columns</h4>
        ${this.data && Object.keys(this.data).length > 0 ? html`
          <select id="select-column" @change="${this.handleColumnChange}">
            ${Object.keys(this.data).map(
              column => html`
                <option value="${column}" ?selected="${this.selectedColumn === column}">${column}</option>`
            )}
          </select>
          <canvas id="pie-chart-canvas"></canvas>
        ` : html`
          <div class="placeholder">No data available to display the chart.</div>
        `}
      </div>
    `;
  }
}
