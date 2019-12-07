import { html, fixture, expect } from '@open-wc/testing';
import { elementUpdated, oneEvent } from '@open-wc/testing-helpers';
import fetchMock from 'fetch-mock';
const APIHost = 'http://localhost:3000';
fetchMock.config.sendAsJson = true;

import './requirement';

describe('<project-requirement>', () => {
  it('should show the requirement title', async () => {
    const title = 'Expected test title';
    const el = await fixture(html`
      <project-requirement .id=${1} .title=${title}></project-requirement>
    `);
    await elementUpdated(el);
    const obtained = el.shadowRoot.querySelector('.title');
    expect(obtained.textContent).to.equal('Expected test title');
  });

  it('should put an input after click on title', async () => {
    const title = 'Expected test title';
    const el = await fixture(html`
      <project-requirement .id=${1} .title=${title}></project-requirement>
    `);
    await elementUpdated(el);
    const titleSpan = el.shadowRoot.querySelector('.title');
    expect(titleSpan.textContent).to.equal('Expected test title');
    const falseClickEvent = new Event('click', { bubbles: true });
    setTimeout(() => titleSpan.dispatchEvent(falseClickEvent));
    const { detail } = await oneEvent(el, 'requirement-edition');
    await elementUpdated(el);
    const input = el.shadowRoot.querySelector('input');
    expect(input).to.not.equal(null);
    expect(input.value).to.equal('Expected test title');
  });

  it('should disable save button if not changed', async () => {
    const title = 'Expected test title';
    const el = await fixture(html`
      <project-requirement .id=${1} .title=${title}></project-requirement>
    `);
    await elementUpdated(el);
    const titleSpan = el.shadowRoot.querySelector('.title');
    expect(titleSpan.textContent).to.equal('Expected test title');
    const falseClickEvent = new Event('click', { bubbles: true });
    setTimeout(() => titleSpan.dispatchEvent(falseClickEvent));
    await oneEvent(el, 'requirement-edition');
    await elementUpdated(el);
    const button = el.shadowRoot.querySelector('button[name="save"]');
    const input = el.shadowRoot.querySelector('input');
    expect(button).to.not.equal(null);
    expect(button.getAttribute('disabled')).to.equal('');
    input.value = 'another title';
    const falseChangeEvent = new Event('change', { bubbles: true });
    input.dispatchEvent(falseChangeEvent);
    await elementUpdated(el);
    expect(button.getAttribute('disabled')).to.equal(null);
  });

  it('should revert on cancel button click', async () => {
    const title = 'Expected test title';
    const el = await fixture(html`
      <project-requirement .id=${1} .title=${title}></project-requirement>
    `);
    await elementUpdated(el);
    const titleSpan = el.shadowRoot.querySelector('.title');
    expect(titleSpan.textContent).to.equal('Expected test title');
    const falseClickEvent = new Event('click', { bubbles: true });
    setTimeout(() => titleSpan.dispatchEvent(falseClickEvent));
    await oneEvent(el, 'requirement-edition');
    await elementUpdated(el);
    const input = el.shadowRoot.querySelector('input');
    input.value = 'another title';
    const falseChangeEvent = new Event('change', { bubbles: true });
    const cancel = el.shadowRoot.querySelector('button[name="cancel"]');
    expect(cancel).to.not.equal(null);
    input.dispatchEvent(falseChangeEvent);
    await elementUpdated(el);
    expect(cancel.getAttribute('disabled')).to.equal(null);
    cancel.dispatchEvent(falseClickEvent);
    await elementUpdated(el);
    const titleSpanAgain = el.shadowRoot.querySelector('.title');
    expect(titleSpanAgain).to.not.equal(null);
    expect(titleSpanAgain.textContent).to.equal(title);
  });

  it('will should show new requirement', async () => {
    const title = 'Expected test title';
    const el = await fixture(html`
      <project-requirement .id=${1} .title=${title}></project-requirement>
    `);
    await elementUpdated(el);
    const detail = {
      id: '3',
      title: 'Sub requirement'
    };
    const creationEvent = new CustomEvent('requirement-created', {
      bubbles: true,
      detail,
    });
    el.shadowRoot.dispatchEvent(creationEvent);
    await elementUpdated(el);
    const created = el.shadowRoot.querySelectorAll('project-requirement');
    expect(created.length).to.equal(1);
  });
});

describe('<requirements-feature> saving behaviors', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should update on save button click', async () => {
    const title = 'Old test title';
    const newTitle = 'Expected another title';
    const confirmation = {
      done: true,
      title: newTitle,
    };
    const mock = fetchMock.patch(APIHost + '/requirements/1', confirmation);
    const el = await fixture(html`
      <project-requirement .id=${1} .title=${title}></project-requirement>
    `);
    await elementUpdated(el);
    const titleSpan = el.shadowRoot.querySelector('.title');
    expect(titleSpan.textContent).to.equal(title);
    const falseClickEvent = new Event('click', { bubbles: true });
    setTimeout(() => titleSpan.dispatchEvent(falseClickEvent));
    await oneEvent(el, 'requirement-edition');
    await elementUpdated(el);
    const input = el.shadowRoot.querySelector('input');
    input.value = newTitle;
    const falseChangeEvent = new Event('change', { bubbles: true });
    const button = el.shadowRoot.querySelector('button[name="save"]');
    expect(button).to.not.equal(null);
    input.dispatchEvent(falseChangeEvent);
    await elementUpdated(el);
    expect(button.getAttribute('disabled')).to.equal(null);
    setTimeout(() => button.dispatchEvent(falseClickEvent));
    await mock.flush();
    await oneEvent(el, 'requirement-saved');
    await elementUpdated(el);
    const titleSpanAgain = el.shadowRoot.querySelector('.title');
    expect(titleSpanAgain).to.not.equal(null);
    expect(titleSpanAgain.textContent).to.equal(newTitle);
  });

  it('should show an error if failed to save', async () => {
    const title = 'Old test title';
    const newTitle = 'Expected another title';
    const error = { error: true, reason: 'something went wrong' };
    const mock = fetchMock.patch(APIHost + '/requirements/1', {
      body: JSON.stringify({
        error: true,
        reason: 'Requirement [1] was not found',
      }),
      status: 404,
    });
    const el = await fixture(html`
      <project-requirement .id=${1} .title=${title}></project-requirement>
    `);
    await elementUpdated(el);
    const titleSpan = el.shadowRoot.querySelector('.title');
    expect(titleSpan.textContent).to.equal(title);
    const falseClickEvent = new Event('click', { bubbles: true });
    setTimeout(() => titleSpan.dispatchEvent(falseClickEvent));
    await oneEvent(el, 'requirement-edition');
    await elementUpdated(el);
    const input = el.shadowRoot.querySelector('input');
    input.value = newTitle;
    const falseChangeEvent = new Event('change', { bubbles: true });
    const button = el.shadowRoot.querySelector('button[name="save"]');
    expect(button).to.not.equal(null);
    input.dispatchEvent(falseChangeEvent);
    await elementUpdated(el);
    expect(button.getAttribute('disabled')).to.equal(null);
    setTimeout(() => button.dispatchEvent(falseClickEvent));
    await mock.flush();
    await oneEvent(el, 'requirement-saved');
    await elementUpdated(el);
    const errorSpan = el.shadowRoot.querySelector('.error');
    expect(errorSpan).to.not.equal(null);
    expect(errorSpan.textContent).to.equal('Requirement [1] was not found');
  });

  it('should show an error even if it comes not as JSON', async () => {
    const title = 'Old test title';
    const newTitle = 'Expected another title';
    const nonJSONError = '<h1>Bad gateway 502</h1>';
    const mock = fetchMock.patch(APIHost + '/requirements/1', {
      body: nonJSONError,
      status: 404,
    });
    const el = await fixture(html`
      <project-requirement .id=${1} .title=${title}></project-requirement>
    `);
    await elementUpdated(el);
    const titleSpan = el.shadowRoot.querySelector('.title');
    expect(titleSpan.textContent).to.equal(title);
    const falseClickEvent = new Event('click', { bubbles: true });
    setTimeout(() => titleSpan.dispatchEvent(falseClickEvent));
    await oneEvent(el, 'requirement-edition');
    await elementUpdated(el);
    const input = el.shadowRoot.querySelector('input');
    input.value = newTitle;
    const falseChangeEvent = new Event('change', { bubbles: true });
    const button = el.shadowRoot.querySelector('button[name="save"]');
    expect(button).to.not.equal(null);
    input.dispatchEvent(falseChangeEvent);
    await elementUpdated(el);
    expect(button.getAttribute('disabled')).to.equal(null);
    setTimeout(() => button.dispatchEvent(falseClickEvent));
    await mock.flush();
    await oneEvent(el, 'requirement-saved');
    await elementUpdated(el);
    const errorSpan = el.shadowRoot.querySelector('.error');
    expect(errorSpan).to.not.equal(null);
    expect(errorSpan.textContent).to.equal("Can't confirm saving");
  });

});
