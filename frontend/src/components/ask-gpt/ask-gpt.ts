import { LitElement, html, css, nothing } from 'lit';
import { property, customElement, query, state } from 'lit/decorators.js';

@customElement('ask-gpt')
class AskGpt extends LitElement {
  @property({ type: String })
  gptResponse: string | null = null;

  @property({ type: Array })
  metaColumns: Array<string> | null = null;

  @query('#submit-button')
  private _submitButton!: HTMLButtonElement;

  @state()
  selectedColumn: string | null = null;

  static styles = css`

    h4 {
      margin: 5px 0;
    }

    p {
      margin: 0;
    }

    .container {
      display: flex;
      padding: 20px 5px;
      max-width: 80%;
      height: 100%;
      flex-direction: column;
      overflow: auto;
    }

    .response-container {
      display: flex;
      flex-direction: column;
    }

    .placeholder {
      text-align: center;
      color: #888;
      font-size: 1.2em;
      padding: 20px;
    }

    .custom-button {
      min-width: 150px;
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

    .custom-button:focus {
      border-color: #2c5060;
      box-shadow: 0 0 5px rgba(44, 80, 96, 0.5);
    }

    .custom-button:hover {
      box-shadow: 0 0 5px rgba(44, 80, 96, 0.5);
      cursor: pointer;
    }

    .custom-button:disabled {
      box-shadow: none;
      cursor: default;
      opacity: 0.5;
    }

    .input-group {
      display: flex;
      flex-direction: row;
      gap: 10px;
    }
  `;

  protected handleColumnChange(event: Event) {
    const columnSelect = event.target as HTMLSelectElement;

    if (columnSelect.value?.length) {
      this.selectedColumn = columnSelect.value;
      this._submitButton.removeAttribute('disabled');
    } else {
      this.selectedColumn = null;
      this._submitButton.disabled = true;
    }
  }

  protected handleSubmit() {
    this.dispatchEvent(new CustomEvent('fetch-gpt-response', { detail: this.selectedColumn }));
  }

  render() {
    return html`
      <div class="container">
        <p>
          Select meta column and press "ask" to see what's ChatGTP has to say about selected meta column.
          <br />
          The response is based on several parameters:
        </p>
        <ol>
          <li>Filename</li>
          <li>Column header</li>
          <li>Total number of rows in the file</li>
          <li>Unique values distribution in selected column</li>
          <li>The names of the rest meta columns</li>
        </ol>
        <div class="input-group">
          <select id="column-select" class="custom-button" @change="${this.handleColumnChange}">
            <option value="">--Select Column--</option>
            ${this.metaColumns?.map(
              column => html`
                <option value="${column}">${column}</option>`
            )}
          </select>
          <button id="submit-button" class="custom-button"
                  disabled="${true}"
                  @click="${this.handleSubmit}"
          >
            Get Response
          </button>
        </div>
        ${
          this.gptResponse
            ? html`
              <div class="response-container">
                <h4>ChatGPT:</h4>
                <p>${this.gptResponse}</p>
              </div>`
            : nothing
        }

      </div>
    `;
  }
}
