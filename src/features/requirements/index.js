import { html, css, LitElement } from 'lit-element';
import './create-requirement';

const APIHost = 'http://localhost:3000';

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

  static get properties() {
    return {
      project: { type: Object },
      id: { type: String },
      error: { type: String },
    };
  }
  constructor() {
    super();
    this.project = null;
    this.error = null;
    this.__receiveResponse = this.__receiveResponse.bind(this);
    this.__handleNewRequirement = this.__handleNewRequirement.bind(this);
  }

  firstUpdated(changedProperties) {
    this.shadowRoot.addEventListener('requirement-created', this.__handleNewRequirement);
    this.__requestProjectData();
    super.firstUpdated(changedProperties);
  }

  __handleNewRequirement(event) {
    const { detail } = event;
    if ( detail.done !== true ) { return; }
    const { requirement } = detail;
    this.project.requirements = [...this.project.requirements, requirement];
    this.requestUpdate();
  }
  __requestProjectData() {
    const { id } = this;
    if (id === undefined) {
      return;
    }
    this.error = null;
    this.project = null;
    fetch(APIHost + '/projects/' + id)
      .then(this.__receiveResponse);
  }

  async __receiveResponse(response) {
    let data = {};
    try {
      const { status } = response;
      data = await response.json();
      if (status === 200) {
        this.project = data;
      } else {
        throw data;
      }
    } catch (error) {
      this.error =
        error.reason !== undefined 
          ? `Error: ${error.reason}`
          : "Error: can't load project";
      this.project = null;
    }
    this.requestUpdate();
  }

  render() {
    if (this.error !== null) {
      return html`
        <div id="error-loading-project" class="error centered">
          ${this.error}
        </div>
      `;
    }
    if (this.project === null) {
      return html`
        <div id="loading-project" class="centered">Loading...</div>
      `;
    }
    const { title, requirements = [] } = this.project;
    return html`
      <div id="project-wrapper">
        <div class="title">${title}</div>
        <div class="requirements">
          ${requirements.map(
            ({ id, title, requirements = [] }) =>
              html`
                <project-requirement
                  .id=${id}
                  .title=${title}
                  .requirements=${requirements}
                >
                </project-requirement>
              `,
          )}
          <div>
            <create-requirement .projectId=${this.project.id}>
            </create-requirement>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('requirements-feature', Requirements);
