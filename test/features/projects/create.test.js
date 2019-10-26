import { html, fixture, expect } from '@open-wc/testing';
import { elementUpdated, oneEvent } from '@open-wc/testing-helpers';

import '../../../src/features/projects/create.js';

function mockCreateProjectEvent(el, title) {
    const creation = el.shadowRoot.querySelector('create-project');
    const bubbles = true;
    const detail = { title };
    const createProjectEvent = new CustomEvent('createproject', {detail, bubbles});
    creation.dispatchEvent(createProjectEvent);
}

function mockRemoveProjectEvent(target) {
    const detail = { target }; 
    const bubbles = true;
    const createProjectEvent = new CustomEvent('removeproject', {detail, bubbles});
    target.dispatchEvent(createProjectEvent);
}

describe('<create-project>', () => {

  it('should set input as title', async () => {
    const el = await fixture(html`
      <create-project></create-project>
    `);
    const input = el.shadowRoot.querySelector('input');
    const button = el.shadowRoot.querySelector('button');
    const detail = {};
    input.value = 'this is a test';
    const falseInputEvent = new CustomEvent('input', { detail, bubbles: true });
    input.dispatchEvent(falseInputEvent);
    await elementUpdated(el);
    expect(el.title).to.equal('this is a test');
    expect(button.getAttribute('disabled')).to.equal('false');
  });

  it('should launch create event', async () => {
    const el = await fixture(html`
      <create-project></create-project>
    `);
    const input = el.shadowRoot.querySelector('input');
    const button = el.shadowRoot.querySelector('button');
    el.title = 'this is a test';
    const falseClickEvent = new Event('click', { bubbles: true });
    setTimeout(() => button.dispatchEvent(falseClickEvent));
    const { detail } = await oneEvent(el, 'createproject');
    expect(detail.title).to.equal('this is a test');
  });

  it('should be disabled on empty title', async () => {
    const el = await fixture(html`
      <create-project></create-project>
    `);
    const input = el.shadowRoot.querySelector('input');
    const button = el.shadowRoot.querySelector('button');
    el.title = '';
    await elementUpdated(el);
    expect(button.getAttribute('disabled')).to.equal("true");
  });
});
