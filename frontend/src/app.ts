import { css, html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import './components/file-breakdown.ts';
import './components/header/header.ts';
import './components/side-bar/side-bar.ts';


@customElement('csv-breakdown-app')
class CsvBreakDownApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      box-sizing: border-box;
    }

    .container {
      display: flex;
      flex-direction: column;
      gap: 10px;
      background-color: #d4e5eaff;
      width: 100%;
      height: 100%;
      overflow: hidden;
      padding: 5px;
      box-sizing: border-box;
    }

    .content {
      display: flex;
      flex-direction: row;
      gap: 10px;
      flex: 1;
      overflow: hidden;
    }
  `;

  @state()
  private _selectedFile: CsvFile | null = null;

  private handleNavigateToFIleBreakdown(event: CustomEvent) {
    this._selectedFile = event.detail;
  }

  render() {
    return html`
      <div class="container">
        <app-header .title="Breakdown"></app-header>
        <div class="content">
          <side-bar @item-selected="${this.handleNavigateToFIleBreakdown}"></side-bar>
          <file-breakdown .selectedFile="${this._selectedFile}"></file-breakdown>
        </div>
      </div>
    `;
  }
}
