import { html, css, LitElement } from 'lit-element';

export class ProjectListItem extends LitElement {
  static get styles() {
    return css`
        :root {
            display: inline;
        }
        .row {
            opacity: 1;
            max-height: 50px; 
            overflow: hidden;
        }
        .row.appears {
            opacity: 0;
            max-height: 0;
        }
        .row, .row.appears {
            transition: all 1s linear;
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
        .row .control {
            opacity: 0;
        }
        .row:hover .control {
            opacity: 1;
        }
        .row .control,
        .row:hover .control {
            transition: all .5s ease-in-out;
        }
    `;
  }

  static get properties() {
    return {
      title: { type: String },
      children: { type: Array },
    };
  }
  firstUpdated() {
    setTimeout( () => {
      const row = this.shadowRoot.querySelector('.row');
      row.classList.remove('appears');
    });
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
    const resource = `#/project/${this.title}`;
    return html`
      <div class="row appears">
        <a href=${resource} class="title">${this.title}</a>
        <button class="control remove" @click=${this.remove}>X</button>
      </div>
    `;
  }
}

customElements.define('project-list-item', ProjectListItem);
