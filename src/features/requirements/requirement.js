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
      requirements: { type: Array },
    };
  }
  constructor() {
    super();
    this.editing = false;
    this.error = null;
    this.__receiveResponse = this.__receiveResponse.bind(this);
    this.__subCreated = this.__subCreated.bind(this);
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
  connectedCallback() {
    super.connectedCallback();
    this.shadowRoot.addEventListener('requirement-created', this.__subCreated);
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
  __subCreated(event) {
    const { detail } = event;
    if (this.requirements === undefined ) {
      this.requirements = [detail];
    } else {
      this.requirements = [...this.requirements, detail];
    }
    this.requestUpdate();
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
  renderEdition() {
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
  renderShow() {
    return html`
      <span class="title" 
        @click=${this.toEditionMode}
        >${this.title}</span>
    `;
  }
  render() {
    return html`
      ${
        this.editing !== false
          ? this.renderEdition()
          : this.renderShow()
    
      }
      ${
        this.requirements !== undefined &&
        this.requirements.map((requirement) => html`
          <project-requirement
            .id=${requirement.id}
            .title=${requirement.title}>
          </project-requirement>
        `)
      }
    `;
  }
}
customElements.define('project-requirement', ProjectRequirement);
