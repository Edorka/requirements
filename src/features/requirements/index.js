import { html, css, LitElement } from 'lit-element';

export class Requirements extends LitElement {
  static get styles() {
    return css`
      :host {
        width: 100%;
        height: 100%;
      }
      .current {
        display: block;
      }
    `;
  }

  render() {
    return html`
      <div class="row appears">
      ${this.id}
      </div>
    `;
  }
}

customElements.define('requirements-feature', Requirements);
