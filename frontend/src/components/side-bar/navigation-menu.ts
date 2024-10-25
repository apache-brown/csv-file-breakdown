import { LitElement, html, css } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('navigation-menu')
class NavigationMenu extends LitElement {
  static styles = css`
    p {
      opacity: 0.5;
      margin: 0;
    }
    .menu-container {
      display: flex;
      width: 200px;
      justify-content: center;
    }

    .menu-list {
      list-style-type: none;
      display: flex;
      flex-direction: column;
      padding: 0;
      margin: 0;
      width: 100%;
    }

    .menu-item {
      cursor: pointer;
      padding: 5px;
      //text-decoration: none;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      width: 100%;
      box-sizing: border-box;
    }

    .menu-item:hover {
      text-decoration: underline;
      list-style-type: disc;
      opacity: 0.6;
    }

    .selected.menu-item {
      text-decoration: underline;
      list-style-type: disc;
      opacity: 0.6;
    }
  `;

  @property({ type: Array })
  items: Array<CsvFile> = [];

  @property({ type: String })
  placeholder: string = 'Click on "+" to select file';

  @state()
  _selected: CsvFile | null = null;

  private selectItem(item: CsvFile) {
    this._selected = item;
    this.dispatchEvent(new CustomEvent('item-selected', { bubbles: true, composed: true, detail: item }));
  }

  private renderItem(item: CsvFile) {
    return html`
      <li class="menu-item ${classMap({ selected: this._selected?._id === item._id })}" title="${item.filename}"
          @click="${() => this.selectItem(item)}">
        ${item.filename}
      </li>
    `;
  }

  render() {
    return html`
      <div class='menu-container'>
        ${this.items && this.items.length > 0
          ? html`
            <ul class="menu-list">${this.items.map((item) => this.renderItem(item))}</ul>`
          : html`<p>${this.placeholder}</p>`}
      </div>
    `;
  }
}
