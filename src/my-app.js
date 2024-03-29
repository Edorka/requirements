import { LitElement, html, css } from 'lit-element';
import { openWc } from './open-wc-logo';
import { SwitchBy } from './components/switch-by-url.js';
import { Requirements } from './features/requirements';
import { ProjectsView } from './features/projects/view';

const mainBgColor = css`#ff9800`;
const mainBgColorDarker = css`#ef6c00`;

class MyApp extends LitElement {
  static get properties() {
    return {
      title: { type: String },
    };
  }

  constructor() {
    super();
    this.projects = [];
  }

  static get styles() {
    return [
      css`
        :host {
          --main-bg-color: ${mainBgColor};
          --main-bg-color-darker: ${mainBgColorDarker};
          text-align: center;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          font-size: calc(10px + 2vmin);
          color: #1a2b42;
          display: flex;
          flex-layout: column;
          height: 100%;
          width: 100%;
        }

        header {
          display: flex;
          flex: 0 0 2.5em;
          background: ${mainBgColor};
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-start;
          width: 100%;
        }

        header .title {
            padding: 0 0.5em;
        }

        a {
          color: #217ff9;
        }

        .app-footer {
          flex: 0 0 1.5em;
          color: #a8a8a8;
          font-size: calc(10px + 0.5vmin);
        }
        switch-by, projects-view {
            flex: 1 1 100%;
        }
      `,
    ];
  }

  render() {
    return html`
      <header class="app-header">
        <span class="title">Proquirements</span>
      </header>
      <switch-by >
        <switch-case path="/projects/:id">
          <requirements-feature projects=${this.projects}></requirements-featurex>
        </switch-case>
        <switch-case path="/projects" defaults="true">
          <projects-view projects=${this.projects} ></projects-view>
        </switch-case>
      </switch-by>
      <p class="app-footer">
        🚽 Made with love b Eduardo Orive following 
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/open-wc">open-wc</a>.
      </p>
    `;
  }
}

customElements.define('my-app', MyApp);
