import { LitElement, css, html } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';


@customElement('file-upload')
export class FileUpload extends LitElement {
  private _placeholder: string = 'Csv files:';

  @state()
  private _selectedFile: File | null;

  @query('#upload-file-form')
  uploadFileForm!: HTMLFormElement;

  @query('#csv-file-input')
  selectFileInput!: HTMLInputElement;

  @query('#upload-file-button')
  uploadFileButton!: HTMLInputElement;

  static styles = css`
    .form-container {
      display: flex;
      flex-direction: column;
    }

    .buttons-container {
      display: flex;
      width: 200px;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 5px;
      margin: 8px 0;

    }

    .select-file-button-container {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 5px;
    }

    .button {
      text-align: center;
      width: 95px;
      min-width: 95px;
      padding: 8px 16px;
      background-color: #2c5060;
      color: white;
      border: none;
      border-radius: 15px;
      cursor: pointer;
      font-size: 14px;
      display: none;

    }

    .button:hover {
      opacity: 0.9;
      box-shadow: 1px 1px 6px 1px #c5c5c5;
    }

    .button:disabled {
      opacity: 0.8;
      cursor: default;
      box-shadow: none;
    }

    input[type='file'] {
      display: none;
    }

    .file-select-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      font-size: 30px;
      cursor: pointer;
      border: none;
      text-align: center;
      line-height: 50px;
      transition: background-color 0.4s;

    }

    .file-select-button:hover {
      opacity: 0.7;
    }

    .file-name {
      text-align: center;
      width: 100px;
      display: block;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      font-weight: bolder;
    }
  `;

  private resetForm() {
    this._selectedFile = null;
    this.uploadFileButton.disabled = true;
    this.uploadFileButton.style.display = 'none';
    this.uploadFileForm.reset();
  }

  private handleFileChange() {
    const files = this.selectFileInput.files;

    if (files && files.length > 0) {
      this._selectedFile = files[0];
      this.uploadFileButton.disabled = false;
      this.uploadFileButton.style.display = 'block';
    } else {
      this._selectedFile = null;
      this.uploadFileButton.disabled = true;
      this.uploadFileButton.style.display = 'none';
    }
  }

  private async handleUploadFile(e: Event) {
    e.preventDefault();

    if (this._selectedFile) {
      this.dispatchEvent(new CustomEvent('file-submit', { detail: { file: this._selectedFile } }));
      this.resetForm();
    }
  }

  render() {
    return html`
      <div class='form-container'>
        <form id='upload-file-form' method='post' enctype='multipart/form-data'>
          <div class='buttons-container'>
            <div class="select-file-button-container">
              <span class='file-name' title="${this._selectedFile?.name || this._placeholder}">
                ${this._selectedFile?.name || this._placeholder}
              </span>
              <label for='csv-file-input' class="file-select-button">
                +
              </label>
              <input id='csv-file-input' type='file' @change='${() => this.handleFileChange()}'
                     accept='.csv' />
            </div>
            <button disabled id='upload-file-button' class='button' @click='${this.handleUploadFile}'>
              Upload
            </button>
          </div>
        </form>
      </div>
    `;
  }
}
