import { html, css, LitElement } from 'lit-element';

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const APIHost = 'http://localhost:3000';

export class CreateProject extends LitElement {
  static get styles() {
    return css`
      :host {
        display: inline;
        padding: 25px;
      }

      button {
        background: var(--main-bg-color);
        box-shadow: -1px 2px 4px rgba(0, 0, 0, 0.15);
        border-radius: 2px;
        border: 1px solid var(--main-bg-color);
        padding: 20px;
        color: white;
        cursor: pointer;
        opacity: 1;
      }

      button[disabled] {
        opacity: 0.5;
        cursor: default;
      }

      button,
      button[disabled] {
        transition: all 0.5s ease-in-out;
      }

      input {
        outline: none;
        background: #ffffff;
        border: 1px solid #d1d9e7;
        box-sizing: border-box;
        border-radius: 2px;
        padding: 20px;
      }
    `;
  }

  static get properties() {
    return {
      title: { type: String },
      color: { type: String },
      error: { type: String },
    };
  }

  constructor() {
    super();
    this.title = '';
    this.error = null;
  }

  titleChanged(event) {
    this.title = event.target.value;
  }

  createClicked(event) {
    event.preventDefault();
    this.__saveProject(this.title);
    return false;
  }

  __saveProject(title) {
    this.error = null;
    fetch(APIHost + '/projects', {
      method: 'POST',
      body: JSON.stringify({ title: title }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(response => this.__receiveResponse(response));
  }
  async __receiveResponse(response) {
    let confirmation = null;
    let result = null;
    try {
      confirmation = await response.json();
      if (confirmation === null || confirmation.id === undefined) {
        throw new Error("Can't confirm saving");
      }
      result = { done: true, confirmation };
      this.title = '';
    } catch (error) {
      this.error = confirmation.reason || error;
      result = { done: false, error };
    }
    const bubbles = true;
    const resultEvent = new CustomEvent('project-created', {
      bubbles,
      detail: result,
    });
    this.dispatchEvent(resultEvent);
    this.requestUpdate();
  }

  render() {
    return html`
      <form>
        <input 
            @input=${this.titleChanged} 
            .value=${this.title} name="title"></input>
        <button 
            type="button"
            @click=${this.createClicked}
            ?disabled=${this.title.length === 0}
            >Create Project</button> 
        ${
          this.error === null
            ? html``
            : html`
                <div class="error">Error: ${this.error}</div>
              `
        }
      </form>
    `;
  }
}

customElements.define('create-project', CreateProject);
