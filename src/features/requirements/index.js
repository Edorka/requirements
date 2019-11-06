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
        this.__receiveResponse = this.__receiveResponse.bind(this);
    }


  firstUpdated(changedProperties) {
    this.__requestProjectData();
    super.firstUpdated(changedProperties);
  }

  __requestProjectData() {
    const { id } = this;
    console.log('__requestProjectData', id);
    if ( id === undefined ) { 
        return;
    }
    fetch(APIHost + '/projects/'+ id)
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
        throw new Error(data.reason);
      }
    } catch (error) {
      this.error = error;
    }
  }

  render() {
    if (this.project === null) {
        return html`<div id="loading-project" class="centered">Loading...</div>`;
    }
    return html`
      <div id="project-wrapper">
        <div class="title">${this.project.title}</div>
      ${this.id}
      </div>
    `;
  }
}

customElements.define('requirements-feature', Requirements);
