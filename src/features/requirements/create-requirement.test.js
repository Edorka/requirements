import { html, fixture, expect } from '@open-wc/testing';
import { elementUpdated, oneEvent } from '@open-wc/testing-helpers';
import fetchMock from 'fetch-mock';
const APIHost = 'http://localhost:3000';
fetchMock.config.sendAsJson = true;

import './create-requirement';

describe('<create-project-requirement>', () => {

  it('should disable save button if no title', async () => {
    const title = 'Expected test title';
    const el = await fixture(html`
      <create-project-requirement></create-project-requirement>
    `);
    await elementUpdated(el);
    const button = el.shadowRoot.querySelector('button[name="save"]');
    const input = el.shadowRoot.querySelector('input');
    expect(button).to.not.equal(null);
    expect(button.getAttribute('disabled')).to.equal('');
    input.value = title;
    const falseChangeEvent = new Event('change', { bubbles: true });
    input.dispatchEvent(falseChangeEvent);
    await elementUpdated(el);
    expect(button.getAttribute('disabled')).to.equal(null);
  });

  it('should revert on clear button click', async () => {
    const el = await fixture(html`
      <create-project-requirement></create-project-requirement>
    `);
    await elementUpdated(el);
    const input = el.shadowRoot.querySelector('input');
    input.value = 'another title';
    const falseChangeEvent = new Event('change', { bubbles: true });
    input.dispatchEvent(falseChangeEvent);
    const clear = el.shadowRoot.querySelector('button[name="clear"]');
    expect(clear).to.not.equal(null);
    const falseClickEvent = new Event('click', { bubbles: true });
    clear.dispatchEvent(falseClickEvent);
    await elementUpdated(el);
    expect(clear.getAttribute('disabled')).to.equal(null);
    clear.dispatchEvent(falseClickEvent);
    await elementUpdated(el);
    const inputAgain = el.shadowRoot.querySelector('input');
    expect(inputAgain.value).to.equal('');
  });
});

describe('<create-requirements-feature> saving behaviors', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should update on save button click', async () => {
    const title = 'A title for test';
    const parentId = 321;
    const projectId = 123;
    const confirmation = {
      done: true,
      requirement: {
          id: 1,
          title,
          projectId,
          parentId
      }
    };
    const saved = new Response(JSON.stringify(confirmation), { status: 201 });
    const mock = fetchMock.postOnce(APIHost + '/requirements', saved);
    const el = await fixture(html`
      <create-project-requirement
        .projectId=${projectId} .parentId=${parentId}
        ></create-project-requirement>
    `);
    await elementUpdated(el);
    const input = el.shadowRoot.querySelector('input');
    input.value = title;
    const falseChangeEvent = new Event('change', { bubbles: true });
    const falseClickEvent = new Event('click', { bubbles: true });
    const button = el.shadowRoot.querySelector('button[name="save"]');
    expect(button).to.not.equal(null);
    input.dispatchEvent(falseChangeEvent);
    await elementUpdated(el);
    expect(button.getAttribute('disabled')).to.equal(null);
    setTimeout(() => button.dispatchEvent(falseClickEvent));
    const result = await mock.flush(true);
    const { detail } = await oneEvent(el, 'requirement-created');
    const [ url, request ] = mock.lastCall(true);
    const { body } = request;
    const json = JSON.parse(body);
    const { done, requirement } = detail;
    expect(done).to.equal(true);
    expect(requirement.title).to.equal(json.title);
    expect(requirement.parentId).to.equal(json.parentId);
    expect(requirement.projectId).to.equal(json.projectId);
    await elementUpdated(el);
    expect(input.value).to.equal('');
  });

  it('should show an error if failed to save', async () => {
    const title = 'Test title';
    const reason = 'Requirement [1] was not found'
    const mock = fetchMock.post(APIHost + '/requirements', {
      body: JSON.stringify({
        error: true,
        reason,
      }),
      status: 500,
    });
    const el = await fixture(html`
      <create-project-requirement ></create-project-requirement>
    `);
    await elementUpdated(el);
    const input = el.shadowRoot.querySelector('input');
    input.value = title;
    const falseChangeEvent = new Event('change', { bubbles: true });
    const button = el.shadowRoot.querySelector('button[name="save"]');
    expect(button).to.not.equal(null);
    input.dispatchEvent(falseChangeEvent);
    await elementUpdated(el);
    expect(button.getAttribute('disabled')).to.equal(null);
    const falseClickEvent = new Event('click', { bubbles: true });
    setTimeout(() => button.dispatchEvent(falseClickEvent));
    await mock.flush();
    const { detail } = await oneEvent(el, 'requirement-created');
    await elementUpdated(el);
    const errorSpan = el.shadowRoot.querySelector('.error');
    expect(errorSpan).to.not.equal(null);
    expect(errorSpan.textContent).to.equal(reason);
    expect(input.value).to.equal(title);
  });

  it('should show an error if not JSON error', async () => {
    const title = 'Title to test';
    const nonJSONError = '<h1>Bad gateway 502</h1>';
    const mock = fetchMock.post(APIHost + '/requirements', {
      body: nonJSONError,
      status: 502,
    });
    const el = await fixture(html`
      <create-project-requirement></create-project-requirement>
    `);
    await elementUpdated(el);
    const button = el.shadowRoot.querySelector('button[name="save"]');
    expect(button).to.not.equal(null);
    const input = el.shadowRoot.querySelector('input');
    input.value = title;
    const falseChangeEvent = new Event('change', { bubbles: true });
    input.dispatchEvent(falseChangeEvent);
    await elementUpdated(el);
    expect(button.getAttribute('disabled')).to.equal(null);
    const falseClickEvent = new Event('click', { bubbles: true });
    setTimeout(() => button.dispatchEvent(falseClickEvent));
    await mock.flush();
    const { detail } = await oneEvent(el, 'requirement-created');
    await elementUpdated(el);
    const errorSpan = el.shadowRoot.querySelector('.error');
    expect(errorSpan).to.not.equal(null);
    const reason = 'Can\'t confirm saving';
    expect(errorSpan.textContent).to.equal(reason);
    expect(input.value).to.equal(title);
  });
});
