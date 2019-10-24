import { html, css, LitElement } from 'lit-element';

export class ProjectListItem extends LitElement {
  static get styles() {
    return css`
        :root {
            display: inline;
        }
        .title, .control{
            display: inline;
            line-height: 2em;
            vertical-align: middle;
        }
        .title {
            font-size: 2em;
        }
        .control {
            background: transparent;
            border-radius: 4em;
            border: solid 1px grey;
            height: 2em;
            width: 2em;
        }
    `;
  }

  static get properties() {
    return {
      title: { type: String },
      children: { type: Array },
    };
  }

  constructor() {
    super();
    this.title = '';
    this.children = [];
  }
  remove(event) {
    const detail = { target: this };
    const bubbles = true;
    this.dispatchEvent(new CustomEvent('removeproject', {bubbles, detail}) );
  }

  render() {
    return html`
      <div class="row">
        <span class="title">${this.title}</span>
        <button class="control remove" @click=${this.remove}>X</button>
      </div>
    `;
  }
}

customElements.define('project-list-item', ProjectListItem);
