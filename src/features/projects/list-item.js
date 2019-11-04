import { html, css, LitElement } from 'lit-element';

const APIHost = 'http://localhost:3000';

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
      .row,
      .row.appears {
        transition: all 1s linear;
      }
      .title,
      .control {
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
        transition: all 0.5s ease-in-out;
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
    setTimeout(() => {
      const row = this.shadowRoot.querySelector('.row');
      row.classList.remove('appears');
    });
  }

  constructor() {
    super();
    this.title = '';
    this.children = [];
  }
  async __receiveResponse(response) {
    let result = null;
    try {
      const confirmation = await response.json();
      if (confirmation.error === true) {
        throw confirmation;
      }
      result = { done: true, target: this };
    } catch (error) {
      const report =
        error instanceof SyntaxError
          ? undefined
          : error.reason !== undefined
          ? error.reason
          : undefined;
      this.error = report || "Can't confirm deletion";
      result = { done: false, error: this.error, target: this };
    }
    const bubbles = true;
    const resultEvent = new CustomEvent('project-removed', {
      bubbles,
      detail: result,
    });
    this.dispatchEvent(resultEvent);
    this.requestUpdate();
  }

  __deleteProject(id) {
    this.error = null;
    fetch(APIHost + '/projects/' + id, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(response => this.__receiveResponse(response));
  }
  remove(event) {
    this.__deleteProject(this.id);
    return false;
  }

  render() {
    const resource = `#/projects/${this.title}`;
    return html`
      <div class="row appears">
        <a href=${resource} class="title">${this.title}</a>
        <button class="control remove" @click=${this.remove}>X</button>
      </div>
    `;
  }
}

customElements.define('project-list-item', ProjectListItem);
