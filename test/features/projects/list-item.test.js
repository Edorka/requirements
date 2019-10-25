import { html, fixture, expect } from '@open-wc/testing';
import { elementUpdated, oneEvent } from '@open-wc/testing-helpers';

import '../../../src/features/projects/list-item.js';


describe('<projects-list-item>', () => {

  it('should show project\'s title', async () => {
    const el = await fixture(html`
      <project-list-item .title=${'Sample project'}></project-list-item>
    `);
    const obtained = el.shadowRoot.querySelector('.row .title');
    expect(obtained.textContent).to.equal('Sample project');
  });

  it('should request project deletion', async () => {
    const emptyProjects = [];
    const el = await fixture(html`
      <project-list-item .title=${'Sample project'}></project-list-item>
    `);
    const removeButton = el.shadowRoot.querySelector('.row .remove');
    const falseClickEvent = new Event('click', { bubbles: true });
    setTimeout(() => removeButton.dispatchEvent(falseClickEvent));
    const { detail } = await oneEvent(el, 'removeproject');
    expect(detail.target.title).to.equal('Sample project');
  });
});
