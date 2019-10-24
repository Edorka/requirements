import { LitElement, html, css } from 'lit-element';
import { openWc } from './open-wc-logo';
import { ProjectsView } from './features/projects/view';

class MyApp extends LitElement {
  static get properties() {
    return {
      title: { type: String },
    };
  }

  constructor() {
    super();
    this.title = 'open-wc';
  }

  static get styles() {
    return [
      css`
        :host {
          text-align: center;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: calc(10px + 2vmin);
          color: #1a2b42;
        }

        header {
          height: auto;
          margin: 0 auto;
        }

        a {
          color: #217ff9;
        }

        .app-footer {
          color: #a8a8a8;
          font-size: calc(10px + 0.5vmin);
        }
      `,
    ];
  }

  render() {
    return html`
      <header class="app-header">
      </header>
      <projects-view></projects-view>
      <p class="app-footer">
        🚽 Made with love by
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/open-wc">open-wc</a>.
      </p>
    `;
  }
}

customElements.define('my-app', MyApp);
