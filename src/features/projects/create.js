import { html, css, LitElement } from 'lit-element';

export class CreateProject extends LitElement {
  static get styles() {
    return css`
      :host {
        display: inline;
        padding: 25px;
      }
      button {
        background: #4D4FEF;
        box-shadow: -1px 2px 4px rgba(0, 0, 0, 0.15);
        border-radius: 2px; 
        border: 1px solid #4D4FEF;
        padding: 20px;
        color: white;
      }
      input {
        background: #FFFFFF;
        /* border-color */
        border: 1px solid #D1D9E7;
        box-sizing: border-box;
        border-radius: 2px;
        padding: 20px;
      }
    `;
  }

  static get properties() {
    return {
      title: { type: String },
    };
  }

  constructor() {
    super();
    this.title = '';
  }

  titleChanged(event) {
    console.log(this, event);
    this.title = event.target.value;
  }

  createClicked(event) {
    event.preventDefault();
    const detail = {title: this.title};
    const bubbles = true;
    this.dispatchEvent(new CustomEvent('createproject', {bubbles, detail}) );
    this.title = '';
    return false;
  }

  render() {
    return html`
      <form>
        <input 
            @input=${this.titleChanged} 
            .value=${this.title} name="title"></input>
        <button 
            type="button"
            @click=${this.createClicked}
            .disabled=${this.title.length === 0}
            >Create Project</button> 
      </form>
    `;
  }
}

customElements.define('create-project', CreateProject);
