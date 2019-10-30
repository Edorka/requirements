import { html, css, LitElement } from 'lit-element';

export class SwitchBy extends LitElement {
  static get styles() {
    return css`
      :host {
        width: 100%;
        height: 100%;
      }
      switch-case {
        display: none;
      }
      switch-case.active {
        display: block;
      }
    `;
  }

  static get properties() {
    return {};
  }

  constructor() {
    super();
    this.handleHashChange = this.handleHashChange.bind(this);
    this.childMatches = this.childMatches.bind(this);
    this.__hash = null;
  }

  childMatches(child, index) {
    return child.matchs(this.__hash);
  }

  handleHashChange() {
    const hash = window.location.hash.replace('#', '');
    if (this.__hash !== hash) {
      this.__hash = hash;
      this.updateChildren();
    }
    return false;
  }

  updateChildren() {
    let activated = null;
    Array.from(this.children).forEach(child => {
      if (activated !== null) {
        child.active = false;
        return;
      }
      const applys = this.childMatches(child);
      const defaults = child.getAttribute('defaults') !== null;
      child.active = applys || defaults;
      activated = child.active ? child : activated;
      child.requestUpdate();
    });
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('hashchange', this.handleHashChange, false, true);
    this.handleHashChange();
  }

  disconnectedCallback() {
    window.removeEventListener('hashchange', this.handleHashChange);
  }

  render() {
    const activated = Array.from(this.children).find(child => child.active);
    return html`
      <div class="current">
        ${activated !== undefined ? activated.render() : null}
      </div>
    `;
  }
}

customElements.define('switch-by', SwitchBy);

const asGroup = (path, fieldName) => `(?<${fieldName}>.*)`;

const fieldPathPart = /:([^\/]+)/gi;

const extractGroups = path => {
  if (path.includes(':') === false) {
    return path;
  }
  return path.replace(fieldPathPart, asGroup);
};

export const expressionFromPath = (path, optionalTrailing = true) => {
  const hasPath = path !== undefined && path.length > 0 && path !== '/';
  const source = hasPath === true ? extractGroups(path) : '/';
  const trailing = optionalTrailing === true && hasPath === true ? '/?' : '';
  return new RegExp(`^${source}${trailing}$`);
};

export class SwitchCase extends LitElement {
  static get styles() {
    return css`
      :host {
        width: 100%;
        height: 100%;
      }
      .case {
        display: none;
      }
      .case.active {
        display: block;
      }
    `;
  }
  static get properties() {
    return {
      path: { type: String },
      active: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.__expression = null;
    this.active = false;
  }

  set path(path) {
    this.__expression = expressionFromPath(path);
  }

  applyParamsToChildren(params) {
    if ( params === undefined || params === null ) {
        return;
    }
    const assignations = Object.entries(params);
    if ( assignations.length === 0 ) {
        return;
    }
    const assign = (child) => {
        assignations.forEach( assignation => {
            const [prop, value] = assignation;
            child[prop] = value;
        });
    };
    Array.from(this.children).forEach(assign);
  }

  matchs(path) {
    if ( this.__expression === null ) { return true; }
    const match = this.__expression.exec(path);
    if ( match === null ) {
        return false || this.defaults === true
    } else {
        this.applyParamsToChildren(match.groups);
        return true;
    }
  }

  old_matchs(path) {
    return this.__expression === null || this.defaults === true
      ? true
      : this.__expression.exec(path) !== null;
  }

  connectedCallback() {
    super.connectedCallback();
  }
  updated() {
    super.updated();
  }

  render() {
    if (this.active !== true) {
      return html``;
    }
    return html`
      ${this.active ? this.children : null}
    `;
  }
}

customElements.define('switch-case', SwitchCase);
