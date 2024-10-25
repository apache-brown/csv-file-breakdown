import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import './pie-chart.ts';
import './bar-chart.ts';

@customElement('csv-insights')
class CsvInsights extends LitElement {
  static styles = css`
      .charts-container {
          padding: 10px;
          display: flex;
          height: 100%;
          flex-direction: row;
          justify-content: center;
          gap: 50px;
          overflow: auto;
      }
  `;

  @property({ type: Object })
  data: InsightsData | null = null;

  render() {
    return html`
      <div class="charts-container">
        <pie-chart .data="${this.data?.meta_value_counts}"></pie-chart>
        <bar-chart .data="${this.data?.missing_values}"></bar-chart>
      </div>
    `;
  }
}
