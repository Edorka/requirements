import { html, css, LitElement } from 'lit-element';

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
  }

  firstUpdated(changedProperties) {
    this.__requestProjectData();
    super.firstUpdated(changedProperties);
  }

  __requestProjectData() {
    const { id } = this;
    if (id === undefined) {
      return;
    }
    this.error = null;
    this.project = null;
    fetch(APIHost + '/projects/' + id)
      .then(this.__receiveResponse)
      .catch(error => (this.error = error.reason));
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
        error.reason !== undefined ? `Error: ${error.reason}` : "Error: can't load project";
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
            project =>
              html`
                <project-requirement
                  .id=${project.id}
                  .title=${project.title}
                  .requirements=${project.requirements}
                >
                </project-requirement>
              `,
          )}
          <div></div>
        </div>
      </div>
    `;
  }
}

customElements.define('requirements-feature', Requirements);
