import { customElement, state } from 'lit/decorators.js';
import { css, html, LitElement } from 'lit';

import {
  uploadFile,
  getFileList,
  responseStatus
} from '../../queries/fetch-requests.ts';

import './navigation-menu.ts';
import './file-upload.ts';

@customElement('side-bar')
class SideBar extends LitElement {
  static styles = css`
    .sidebar {
      display: flex;
      height: 100%;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      width: 250px;
      padding: 10px;
      box-sizing: border-box;
      box-shadow: 0 2px 5px #00000033;
      background-color: #ffffff;
    }
  `;

  @state()
  private _files: Array<CsvFile> | null = null;

  @state()
  private _selectedFile: CsvFile | null = null;

  async firstUpdated() {
    await this.fetchFileList();
  }

  private async fetchFileList() {
    const apiResponse = await getFileList();

    if (apiResponse.status === responseStatus.OK) {
      this._files = apiResponse.data;
    }
  }

  private async handleFileUpload(event: CustomEvent) {
    const file = event.detail.file as File;
    const response = await uploadFile(file);

    if (response.status === responseStatus.OK) {
      await this.fetchFileList();
    }
  }

  render() {
    return html`
      <nav class="sidebar">
        <file-upload @file-submit="${this.handleFileUpload}"></file-upload>
        <navigation-menu .items="${this._files}">
        </navigation-menu>
      </nav>
    `;
  }
}

