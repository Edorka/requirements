import { html, css, LitElement } from 'lit-element';

export class SwitchBy extends LitElement {
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
    return {};
  }

  constructor() {
    super();
    this.handleHashChange = this.handleHashChange.bind(this);
    this.childMatches = this.childMatches.bind(this);
    this.__hash = null;
  }

  childMatches(child) {
    return child.matchs(this.__hash);
  }

  handleHashChange() {
    const hash = window.location.hash.replace('#', '');
    if (this.__hash !== hash) {
      this.__hash = hash;
      this.requestUpdate();
    }
    return false;
  }

  update() {
    this.updateChildren();
    super.update();
  }

  updateChildren() {
    let activated = null;
    Array.from(this.children).forEach(child => {
      if (activated !== null) {
        child.active = false;
        return;
      }
      const applys = this.childMatches(child);
      child.active = applys;
      activated = applys ? child : activated;
      child.requestUpdate();
    });
    this.requestUpdate();
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
        ${activated}
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
      defaults: { type: Boolean },
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
    } 
        this.applyParamsToChildren(match.groups);
        return true;
    
  }

  connectedCallback() {
    super.connectedCallback();
  }


  render() {
    return html`
      ${this.active ? this.children : html``}
    `;
  }
}

customElements.define('switch-case', SwitchCase);
