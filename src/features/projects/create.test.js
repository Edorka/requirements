import { html, fixture, expect } from '@open-wc/testing';
import { elementUpdated, oneEvent } from '@open-wc/testing-helpers';
import fetchMock from 'fetch-mock';
import './create.js';

fetchMock.config.sendAsJson = true;
const APIHost = 'http://localhost:3000';

function mockCreateProjectEvent(el, title) {
  const creation = el.shadowRoot.querySelector('create-project');
  const bubbles = true;
  const detail = { title };
  const createProjectEvent = new CustomEvent('project-created', { detail, bubbles });
  creation.dispatchEvent(createProjectEvent);
}

function mockRemoveProjectEvent(target) {
  const detail = { target };
  const bubbles = true;
  const createProjectEvent = new CustomEvent('project-removed', { detail, bubbles });
  target.dispatchEvent(createProjectEvent);
}

describe('<create-project>', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

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
    expect(button.getAttribute('disabled')).to.equal(null);
  });

  it('should be disabled on empty title', async () => {
    const el = await fixture(html`
      <create-project></create-project>
    `);
    const input = el.shadowRoot.querySelector('input');
    const button = el.shadowRoot.querySelector('button');
    el.title = '';
    await elementUpdated(el);
    expect(button.getAttribute('disabled')).to.not.equal(null);
  });

  it('should launch create event when POST succeeds', async () => {
    const newProject = {
      id: 1,
      title: 'This is a test',
      requirements: [],
    };
    const saved = new Response(JSON.stringify(newProject), { status: 201 });
    const mock = fetchMock.post(APIHost + '/projects', saved);
    const el = await fixture(html`
      <create-project></create-project>
    `);
    const input = el.shadowRoot.querySelector('input');
    const button = el.shadowRoot.querySelector('button');
    el.title = 'this is a test';
    const falseClickEvent = new Event('click', { bubbles: true });
    setTimeout(() => button.dispatchEvent(falseClickEvent));
    const { detail } = await oneEvent(el, 'project-created');
    const { done, confirmation } = detail;
    expect(done).to.equal(true);
    expect(confirmation.title).to.equal('This is a test');
    expect(confirmation.id).to.equal(1);
    expect(confirmation.requirements.length).to.equal(0);
  });

  it('should show error if POST fails', async () => {
    const report = {
      error: true,
      reason: 'DB is full',
    };
    const confirmation = new Response(JSON.stringify(report), { status: 500 });
    const mock = fetchMock.post(APIHost + '/projects', confirmation);
    const el = await fixture(html`
      <create-project></create-project>
    `);
    const input = el.shadowRoot.querySelector('input');
    const button = el.shadowRoot.querySelector('button');
    el.title = 'this will fail';
    const falseClickEvent = new Event('click', { bubbles: true });
    setTimeout(() => button.dispatchEvent(falseClickEvent));
    await elementUpdated(el);
    await mock.flush();
    const { detail } = await oneEvent(el, 'project-created');
    const { done, error } = detail;
    expect(done).to.equal(false);
    expect(error).to.not.equal(undefined);
    const errorMessage = el.shadowRoot.querySelector('.error');
    expect(errorMessage).to.not.equal(null);
    expect(errorMessage.textContent).to.equal('Error: DB is full');
    expect(input.value).to.equal('this will fail');
  });
});
