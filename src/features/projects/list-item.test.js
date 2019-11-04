import { html, fixture, expect } from '@open-wc/testing';
import { elementUpdated, oneEvent } from '@open-wc/testing-helpers';
import fetchMock from 'fetch-mock';
fetchMock.config.sendAsJson = true;
const APIHost = 'http://localhost:3000';
import './list-item.js';

describe('<projects-list-item>', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it("should show project's title", async () => {
    const el = await fixture(html`
      <project-list-item .title=${'Sample project'}></project-list-item>
    `);
    const obtained = el.shadowRoot.querySelector('.row .title');
    expect(obtained.textContent).to.equal('Sample project');
  });

  it('should confirm project deletion', async () => {
    const done = {
      done: true,
      id: 1,
    };
    const saved = new Response(JSON.stringify(done), { status: 200 });
    const mock = fetchMock.delete(APIHost + '/projects/1', saved);
    const el = await fixture(html`
      <project-list-item .id=${1} .title=${'Sample project'}></project-list-item>
    `);
    const removeButton = el.shadowRoot.querySelector('.row .remove');
    const falseClickEvent = new Event('click', { bubbles: true });
    await mock.flush();
    setTimeout(() => removeButton.dispatchEvent(falseClickEvent));
    const { detail } = await oneEvent(el, 'project-removed');
    expect(detail.target.title).to.equal('Sample project');
  });

  it('should report failure reason during deletion', async () => {
    const done = {
      error: true,
      reason: 'project not found',
    };
    const saved = new Response(JSON.stringify(done), { status: 404 });
    const mock = fetchMock.delete(APIHost + '/projects/1', saved);
    const el = await fixture(html`
      <project-list-item .id=${1} .title=${'Sample project'}></project-list-item>
    `);
    const removeButton = el.shadowRoot.querySelector('.row .remove');
    const falseClickEvent = new Event('click', { bubbles: true });
    await mock.flush();
    setTimeout(() => removeButton.dispatchEvent(falseClickEvent));
    const { detail } = await oneEvent(el, 'project-removed');
    expect(detail.error).to.equal('project not found');
    expect(detail.target.title).to.equal('Sample project');
  });

  it('should report failure of unknown reason during deletion', async () => {
    const error = {
      error: true,
    };
    const saved = new Response(JSON.stringify(error), { status: 404 });
    const mock = fetchMock.delete(APIHost + '/projects/1', saved);
    const el = await fixture(html`
      <project-list-item .id=${1} .title=${'Sample project'}></project-list-item>
    `);
    const removeButton = el.shadowRoot.querySelector('.row .remove');
    const falseClickEvent = new Event('click', { bubbles: true });
    await mock.flush();
    setTimeout(() => removeButton.dispatchEvent(falseClickEvent));
    const { detail } = await oneEvent(el, 'project-removed');
    expect(detail.error).to.equal("Can't confirm deletion");
    expect(detail.target.title).to.equal('Sample project');
  });

  it('should report failure of unknown reason on response parsing', async () => {
    const error = '<div>Gateway error 502</div>';
    const saved = new Response(error, { status: 404 });
    const mock = fetchMock.delete(APIHost + '/projects/1', saved);
    const el = await fixture(html`
      <project-list-item .id=${1} .title=${'Sample project'}></project-list-item>
    `);
    const removeButton = el.shadowRoot.querySelector('.row .remove');
    const falseClickEvent = new Event('click', { bubbles: true });
    await mock.flush();
    setTimeout(() => removeButton.dispatchEvent(falseClickEvent));
    const { detail } = await oneEvent(el, 'project-removed');
    expect(detail.error).to.equal("Can't confirm deletion");
    expect(detail.target.title).to.equal('Sample project');
  });
});
