import Chart from 'chart.js/auto';

import { LitElement, html, css, PropertyValues } from 'lit';
import { property, customElement, query } from 'lit/decorators.js';

import { ChartInstance } from '../../types/insights';

interface MissingValuesData {
  [key: string]: {
    column_index: number;
    missing_percentage: number;
  };
}

@customElement('bar-chart')
class BarChart extends LitElement {
  @property({ type: Object })
  data: MissingValuesData | null = null;

  @query('#bar-chart-canvas')
  canvas!: HTMLCanvasElement;

  private chart: ChartInstance | null = null;

  static styles = css`
    canvas {
      width: 100%;
      height: 400px;
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

    .placeholder {
      text-align: center;
      color: #888;
      font-size: 1.2em;
      padding: 20px;
    }
  `;

  protected firstUpdated() {
    this.createChart();
  }

  protected updated(_changedProperties: PropertyValues) {
    if (_changedProperties.has('data')) {
      this.updateChart();
    }
  }

  createChart() {
    if (!this.data || Object.keys(this.data).length === 0) {
      return;
    }

    const ctx = this.canvas.getContext('2d');
    const labels = Object.keys(this.data);

    const values = labels.map(label => this.data![label].missing_percentage);

    this.chart = new Chart(ctx!, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Percentage of Missing Values',
          data: values,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }

  updateChart() {
    if (this.chart) {
      this.chart.destroy();
    }
    this.createChart();
  }

  render() {
    return html`
      <div class="chart-container">
        <h4>Empty Cells Breakdown</h4>
        ${this.data && Object.keys(this.data).length > 0 ? html`
          <canvas id="bar-chart-canvas"></canvas>
        ` : html`
          <div class="placeholder">No data available to display the chart.</div>
        `}
      </div>
    `;
  }
}
