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
      }`
   }

   
  static get properties() {
    return {
    };
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
    if ( this.__hash !== hash ) {
        console.log('handleHashChange', hash, window.location.path);
        this.__hash = hash;
        this.updateChildren();
    }
    return false;
  }

  updateChildren() {
    let activated = null;
    Array.from(this.children).forEach( child => {
        if ( activated !== null ) {
            child.active = false;
            child.slot = 'hidden';
            return;
        }
        const applys = this.childMatches(child);
        const defaults = child.getAttribute('defaults') !== null;
        child.active = applys || defaults;
        if ( child.active ) {
            child.classList.add('active');
        } else {
            child.classList.remove('active');
        }
        activated = child.active ? child : null;
        child.requestUpdate();
    });
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("hashchange", this.handleHashChange, false, true);
    this.handleHashChange();
    console.log('waiting for state change');
  }


  render() {
    return html`
        <div class="current">
        ${ this.children }
        </div>
    `;
  }
}

customElements.define('switch-by', SwitchBy);

const asGroup = (path, fieldName) =>
    `(?<${fieldName}>.*)`

const fieldPathPart = /:([^\/]+)/ig;

const extractGroups = (path)  => {
    if ( path.includes(':') === false ){ return path };
    return path.replace(fieldPathPart, asGroup);
}

export const expressionFromPath = (path, optionalTrailing=true) => {
    const hasPath =(path !== undefined && path.length > 0 && path !== '/');
    const source = hasPath === true 
        ? extractGroups(path)
        : '/';
    const trailing = optionalTrailing === true && hasPath === true
        ? '/?'
        : ''
    return new RegExp(`^${source}${trailing}$`);
}

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
      }`

   }
  static get properties() {
    return {
      path: { type: String },
      active: { type: Boolean }
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

  matchs(path) {
    return this.__expression === null || this.defaults
        ? true
        : this.__expression.exec(path) !== null;
  }

  render() {
     return html`
        ${this.children}
     `;
  }
};


customElements.define('switch-case', SwitchCase);
