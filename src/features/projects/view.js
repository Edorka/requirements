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
    };
  }

  constructor() {
    super();
    this.projects = [];
    this.__createProject = this.__createProject.bind(this);
    this.__removeProject = this.__removeProject.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.shadowRoot.addEventListener('createproject', this.__createProject);
    this.shadowRoot.addEventListener('removeproject', this.__removeProject);
  }

  disconnectedCallback() {
    this.shadowRoot.removeEventListener('createproject', this.__createProject);
    this.shadowRoot.removeEventListener('removeproject', this.__removeProject);
    super.disconnectedCallback();
  }

  __createProject(e) {
    const {detail} = e;
    this.projects = [ ...this.projects,  {title: detail.title, children: []}];
  }

  __removeProject(e) {
    const {detail} = e;
    const {target} = detail;
    this.projects = this.projects.filter(project => project.title !== target.title);
  }

  render() {
    return html`
      <h1>Projects:</h1>
      <create-project></create-project>
      ${this.projects.length === 0 
        ? html`<div>No projects</div>`
        : this.projects.map( project => 
            html`<project-list-item .title=${project.title}></project-list-item>`)
      }
    `;
  }
}

customElements.define('projects-view', ProjectsView);
