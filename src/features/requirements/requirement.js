import { html, css, LitElement } from 'lit-element';
const APIHost = 'http://localhost:3000';

export class ProjectRequirement extends LitElement {
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
      title: { type: String },
      id: { type: String },
    };
  }
  constructor() {
    super();
    this.editing = false;
    this.__receiveResponse = this.__receiveResponse.bind(this);
  }
  editionChange(event) {
    this.editing = event.target.value;
    this.requestUpdate();
  }
  toEditionMode(event) {
    this.editing = this.title;
    const details = { id: this.id };
    const bubbles = true;
    const report = new CustomEvent('requirement-edition', { details, bubbles });
    this.dispatchEvent(report);
    this.requestUpdate();
  }
  get didntChanged() {
    return this.title === this.editing;
  }
  clickedSave(event) {
    this.__requestSave();
  }
  __requestSave() {
    const { id, title } = this;
    if (id === undefined) {
      return;
    }
    this.error = null;
    fetch(APIHost + '/requirements/' + id, {
      method: 'PATCH',
      body: JSON.stringify({ title: title }),
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
      result = { done: true, confirmation };
      this.title = confirmation.title;
      this.editing = false;
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
    const resultEvent = new CustomEvent('requirement-saved', {
      bubbles,
      detail: result,
    });
    this.dispatchEvent(resultEvent);
    this.requestUpdate();
  }

  cancel(event) {
    this.editing = false;
    this.requestUpdate();
  }
  render() {
    if (this.editing !== false) {
      return html`
            <input type="text" 
                value=${this.editing} 
                @change=${this.editionChange}>
            </input>   
            <button class="small" name="save"
                @click=${this.clickedSave}
                ?disabled=${this.didntChanged}></button>
            <button class="small" name="cancel"
                @click=${this.cancel}></button>
            ${
              this.error !== null
                ? html`
                    <span class="error">${this.error}</span>
                  `
                : ''
            }
        `;
    }
    return html`
      <span class="title" @click=${this.toEditionMode}>${this.title}</span>
    `;
  }
}
customElements.define('project-requirement', ProjectRequirement);
