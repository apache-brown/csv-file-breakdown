import { css, html, LitElement, nothing, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import {
  getFileInsights,
  getFileRows,
  getGptResponse,
  responseStatus
} from '../queries/fetch-requests.ts';

import './explorer/csv-table.ts';
import './insights/csv-insights.ts';
import './ask-gpt/ask-gpt.ts';


@customElement('file-breakdown')
class FileBreakdown extends LitElement {
  static styles = css`
    :host {
      height: 100%;
      width: 100%;
    }

    .breakdown-container {
      display: flex;
      flex-direction: column;
      padding: 5px;
      height: 100vh;
      width: 100%;
      box-shadow: 0 2px 5px #00000033;
      background-color: #ffffff;;
    }

    .breakdown-inner-container {
      flex: 1;
      overflow-y: auto;
      padding: 15px;
      box-sizing: border-box;
    }

    .filename {
      margin: 5px 5px;
      font-weight: bold;
    }

    .tabs {
      display: flex;
      align-items: center;
      gap: 5px;
      list-style: none;
      padding: 0;
    }

    .tab {
      padding: 5px 5px;
      border-radius: 4px;
      cursor: pointer;
      opacity: 0.5;
    }

    .tab:hover {
      opacity: 1;
    }

    .tab.active {
      cursor: default;
      opacity: 1;
    }

    .tab.disabled {
      cursor: default;
    }

    .breadcrumb-separator {
      margin: 0 2px;
    }
  `;

  private _placeHolder: string = 'No file selected';

  @property({ type: String })
  selectedFile: CsvFile | null = null;

  @state()
  private _loading: boolean = false;

  @state()
  private _activeTab: string = 'insights';

  @state()
  private _explorerData: ExplorerData | null = null;

  @state()
  private _insightsData: InsightsData | null = null;

  @state()
  private _gptResponse: string | null = null;

  @state()
  private _skip: number = 0;

  @state()
  private _limit: number = 10;


  protected async willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);

    if (_changedProperties.has('selectedFile')) {
      this.resetStates();
      void await this.fetchDataForActiveTab();
    }
  }

  private resetStates() {
    this._explorerData = null;
    this._insightsData = null;
    this._gptResponse = null;

    this._skip = 0;
    this._limit = 10;
  }

  private async fetchDataForActiveTab() {
    if (!this.selectedFile?._id) {
      return;
    }

    this._loading = true;

    try {
      switch (this._activeTab) {
        case 'explorer':
          if (!this._explorerData) {
            await this.fetchExplorerData();
          }
          break;
        case 'insights':
          if (!this._insightsData) {
            await this.fetchInsightsData();
          }
          break;
        default:
          break;
      }
    } finally {
      this._loading = false;
    }
  }

  private async fetchExplorerData() {
    if (this.selectedFile?._id) {
      this._loading = true;

      const response = await getFileRows(this.selectedFile._id, this._skip, this._limit);
      if (response.status === responseStatus.OK) {
        this._explorerData = response.data;
      }
      this._loading = false;
    }
  }

  private async fetchInsightsData() {
    if (this.selectedFile?._id) {
      this._loading = true;

      const response = await getFileInsights(this.selectedFile._id);
      if (response.status === responseStatus.OK) {
        this._insightsData = response.data;
      }
      this._loading = false;
    }
  }

  private async fetchGptResponse(columnName: string) {
    if (this.selectedFile?._id) {
      this._loading = true;

      const response = await getGptResponse(this.selectedFile._id, columnName);
      if (response.status === responseStatus.OK) {
        this._gptResponse = response.data;
      }
      this._loading = false;
    }
  }

  private async handlePageChange(eventData: { skip: number, limit: number }) {
    this._skip = eventData.skip;
    this._limit = eventData.limit;

    await this.fetchExplorerData();
  }

  private async handleFetchGptResponse(columnName: string) {
    await this.fetchGptResponse(columnName);
  }

  private async handleTabChange(tab: string) {
    this._activeTab = tab;
    await this.fetchDataForActiveTab();
  }

  private getMetaColumnsFromConfig() {
    return Object.entries(this.selectedFile?.columns_config ?? {})
      .filter(entries => entries[1].type === 'meta')
      .map(entries => entries[0]);
  }

  private getDataComponent() {
    if (!this.selectedFile?._id) {
      return html`<p style="opacity: 0.5; margin: 5px">Please select a file</p>`
    }

    switch (this._activeTab) {
      case 'explorer':
        return html`
          <csv-table
            .data="${this._explorerData}"
            .skip="${this._skip}"
            .limit="${this._limit}"
            @page-change="${(e: CustomEvent) => this.handlePageChange(e.detail)}">
          </csv-table>`;
      case 'insights':
        return html`
          <csv-insights .data="${this._insightsData}"></csv-insights>`;
      case 'ask-gpt':
        return html`
          <ask-gpt
            .gptResponse="${this._gptResponse}"
            .metaColumns="${this.getMetaColumnsFromConfig()}"
            @fetch-gpt-response="${(e: CustomEvent) => this.handleFetchGptResponse(e.detail)}"
          >
          </ask-gpt>`;
      default:
        return html`<h3>No Tab Is Selected</h3>`;
    }
  }

  render() {
    return html`
      <div class="breakdown-container">
        <div class="breakdown-inner-container">
          <div class="tabs">
            <div
              class="tab ${classMap({ active: this._activeTab === 'insights' })}"
              @click="${() => this.handleTabChange('insights')}"
            >
              Insights
            </div>
            <div class="breadcrumb-separator">/</div>
            <div
              class="tab ${classMap({ active: this._activeTab === 'ask-gpt' })}"
              @click="${() => this.handleTabChange('ask-gpt')}"
            >
              Ask ChatGPT
            </div>
            <div class="breadcrumb-separator">/</div>
            <div
              class="tab ${classMap({ active: this._activeTab === 'explorer' })}"
              @click="${() => this.handleTabChange('explorer')}"
            >
              Explorer
            </div>
            <div class="filename">${this.selectedFile?.filename || this._placeHolder}</div>
            ${this._loading
              ? html`
                <div class="spinner">Loading...</div>`
              : nothing
            }
          </div>
          ${this.getDataComponent()}
        </div>
      </div>
    `;
  }
}
