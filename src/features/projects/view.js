import { html, css, LitElement } from 'lit-element';
import { CreateProject } from './create';
import { ProjectListItem } from './list-item';

export class ProjectsView extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        padding: 25px;
        font-size: 14px;
        line-height: 18px;
        display: flex;
        align-items: center;
        text-align: center;
      }
    `;
  }

  static get properties() {
    return {
      projects: { type: Array },
      error: { type: String },
    };
  }

  constructor() {
    super();
    this.projects = null;
    this.error = null;
    this.__createProject = this.__createProject.bind(this);
    this.__removeProject = this.__removeProject.bind(this);
    this.__receiveResponse = this.__receiveResponse.bind(this);
  }

  setProjects(projects) {
    this.projects = projects;
    this.requestUpdate();
  }

  async __receiveResponse(response) {
    let data = {};
    try {
      const { status } = response;
      data = await response.json();
      if (status <= 300 && status >= 200) {
        this.setProjects(data.items);
      } else {
        throw new Error(data.reason);
      }
    } catch (error) {
      this.error = error;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    const APIHost = 'http://localhost:3000';
    this.errors = null;
    fetch(APIHost + '/projects')
      .then(this.__receiveResponse)
      .catch(error => (this.error = error.reason));
    this.shadowRoot.addEventListener('createproject', this.__createProject);
    this.shadowRoot.addEventListener('removeproject', this.__removeProject);
  }

  disconnectedCallback() {
    this.shadowRoot.removeEventListener('createproject', this.__createProject);
    this.shadowRoot.removeEventListener('removeproject', this.__removeProject);
    super.disconnectedCallback();
  }

  __createProject(e) {
    const { detail } = e;
    this.projects = [...this.projects, { title: detail.title, children: [] }];
  }

  __removeProject(e) {
    const { detail } = e;
    const { target } = detail;
    this.projects = this.projects.filter(project => project.title !== target.title);
  }

  render() {
    return html`
      <h1>Projects:</h1>
      <create-project></create-project>
      ${this.error === null
        ? html``
        : html`
            <div class="error">${this.error}</div>
          `}
      ${this.projects === null || this.projects === undefined
        ? html`
            <div id="loading-data">Loading projects...</div>
          `
        : this.projects.length === 0
        ? html`
            <div id="no-projects-found">No projects</div>
          `
        : this.projects.map(
            project =>
              html`
                <project-list-item .title=${project.title}></project-list-item>
              `,
          )}
    `;
  }
}

customElements.define('projects-view', ProjectsView);
