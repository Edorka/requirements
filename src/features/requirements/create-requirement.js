import { html, css, LitElement } from 'lit-element';
const APIHost = 'http://localhost:3000';

export class CreateProjectRequirement extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: row;
        width: 100%;
      }
      .current {
        display: block;
      }
    `;
  }
  static get properties() {
    return {
        parentId: Number,
        projectId: Number
    }
  }
  constructor() {
    super();
    this.error = null;
    this.__receiveResponse = this.__receiveResponse.bind(this);
  }
  editionChange(event) {
    this.title = event.target.value;
    this.requestUpdate();
  }
  get notSuitable() {
    return this.title === '';
  }
  clickedSave(event) {
    this.__requestSave();
  }
  __requestSave() {
    const { parentId, projectId, title } = this;
    this.error = null;
    fetch(APIHost + '/requirements', {
      method: 'POST',
      body: JSON.stringify({ title, projectId, parentId}),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(this.__receiveResponse);
  }
  async __receiveResponse(response) {
    let result = null;
    try {
      const confirmation = await response.json();
      if (confirmation.error === true) {
        throw confirmation;
      }
      result = confirmation;
      this.__clear();
    } catch (error) {
      const report =
        error instanceof SyntaxError
          ? undefined
          : error.reason !== undefined
          ? error.reason
          : undefined;
      this.error = report || "Can't confirm saving";
      result = { done: false, error: this.error };
    }
    const bubbles = true;
    const resultEvent = new CustomEvent('requirement-created', {
      bubbles,
      detail: result,
    });
    this.dispatchEvent(resultEvent);
    this.requestUpdate();
  }

  clickedClear(event) {
      this.__clear();
  }
  __clear() {
    const input = this.shadowRoot.querySelector('input');
    input.value = this.title = '';
    this.requestUpdate();
  }
  render() {
    return html`
        <input type="text" 
            value=${this.title} 
            @change=${this.editionChange}>
        </input>   
        <button class="small" name="save"
            @click=${this.clickedSave}
            ?disabled=${this.notSuitable}></button>
        <button class="small" name="clear"
            @click=${this.clickedClear}></button>
        ${
          this.error !== null
            ? html`
                <span class="error">${this.error}</span>
              `
            : ''
        }
    `;
  }
}
customElements.define('create-project-requirement', CreateProjectRequirement);
