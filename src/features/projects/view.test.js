import { html, fixture, expect } from '@open-wc/testing';
import { elementUpdated } from '@open-wc/testing-helpers';
import fetchMock from 'fetch-mock';
import './view.js';

fetchMock.config.sendAsJson = true;

function mockCreateProjectEvent(el, title) {
  const creation = el.shadowRoot.querySelector('create-project');
  const bubbles = true;
  const detail = { title };
  const createProjectEvent = new CustomEvent('createproject', { detail, bubbles });
  creation.dispatchEvent(createProjectEvent);
}

function mockRemoveProjectEvent(target) {
  const detail = { target };
  const bubbles = true;
  const createProjectEvent = new CustomEvent('removeproject', { detail, bubbles });
  target.dispatchEvent(createProjectEvent);
}
const APIHost = 'http://localhost:3000';

describe('<projects-view>', () => {
  const overwriteRoutes = true;
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should put loading while no data ', async () => {
    const el = await fixture(html`
      <projects-view></projects-view>
    `);
    await elementUpdated(el);
    console.log('loading', el.shadowRoot);
    const obtained = el.shadowRoot.getElementById('loading-data');
    expect(obtained.textContent).to.equal('Loading projects...');
  });

  it('should put no-projects text', async () => {
    const mock = fetchMock.get(APIHost + '/projects', { items: [] }, { overwriteRoutes });
    const el = await fixture(html`
      <projects-view></projects-view>
    `);
    await elementUpdated(el);
    await mock.flush();
    await elementUpdated(el);
    const obtained = el.shadowRoot.getElementById('no-projects-found');
    expect(obtained).to.not.equal(null);
    expect(obtained.textContent).to.equal('No projects');
  });

  it('should show error response', async () => {
    const error = { error: true, reason: 'something went wrong' };
    const failure = new Response(error, { status: 500 });
    const mock = fetchMock.mock(APIHost + '/projects', {
      body: { reason: 'something went wrong' },
      status: 500,
    });
    const el = await fixture(html`
      <projects-view></projects-view>
    `);
    await mock.flush();
    await elementUpdated(el);
    const reports = el.shadowRoot.querySelector('.error');
    expect(reports.textContent).to.equal('Error: something went wrong');
  });

  it('or show one project', async () => {
    const items = [{ title: 'First project' }];
    const mock = fetchMock.get(APIHost + '/projects', { items }, { overwriteRoutes });
    const el = await fixture(html`
      <projects-view></projects-view>
    `);
    await mock.flush();
    await elementUpdated(el);
    const obtained = el.shadowRoot.querySelectorAll('project-list-item');
    expect(obtained.length).to.equal(1);
  });

  it('creates project by event', async () => {
    const items = [{ title: 'First project' }];
    const mock = fetchMock.get(APIHost + '/projects', { items }, { overwriteRoutes });
    const el = await fixture(html`
      <projects-view></projects-view>
    `);
    await mock.flush();
    await elementUpdated(el);
    mockCreateProjectEvent(el, 'A new project');
    await elementUpdated(el);
    const obtained = el.shadowRoot.querySelectorAll('project-list-item');
    expect(obtained.length).to.equal(2);
    expect(obtained[1].title).to.equal('A new project');
  });

  it('removed project by event', async () => {
    const items = [
      { title: 'First project' },
      { title: 'Second project' },
      { title: 'Third project' },
    ];
    const mock = fetchMock.get(APIHost + '/projects', { items }, { overwriteRoutes });
    const el = await fixture(html`
      <projects-view></projects-view>
    `);
    await mock.flush();
    const elements = el.shadowRoot.querySelectorAll('project-list-item');
    expect(elements.length).to.equal(3);
    const element = elements[0];
    mockRemoveProjectEvent(element);
    await elementUpdated(el);
    const obtained = el.shadowRoot.querySelectorAll('project-list-item');
    expect(obtained.length).to.equal(2);
  });

  it('wont hear creation events when disconnected', async () => {
    const items = [
      { title: 'First project' },
      { title: 'Second project' },
      { title: 'Third project' },
    ];
    const mock = fetchMock.get(APIHost + '/projects', { items }, { overwriteRoutes });
    const el = await fixture(html`
      <projects-view></projects-view>
    `);
    await mock.flush();
    const elements = el.shadowRoot.querySelectorAll('project-list-item');
    expect(elements.length).to.equal(3);
    el.disconnectedCallback();
    mockCreateProjectEvent(el, 'Should not exist');
    await elementUpdated(el);
    const obtained = el.shadowRoot.querySelectorAll('project-list-item');
    expect(obtained.length).to.equal(3);
    const element = elements[0];
    mockRemoveProjectEvent(element);
  });

  it('wont hear removal events when disconnected', async () => {
    const items = [
      { title: 'First project' },
      { title: 'Second project' },
      { title: 'Third project' },
    ];
    const mock = fetchMock.get(APIHost + '/projects', { items });
    const el = await fixture(html`
      <projects-view></projects-view>
    `);
    await mock.flush();
    const elements = el.shadowRoot.querySelectorAll('project-list-item');
    expect(elements.length).to.equal(3);
    el.disconnectedCallback();
    await elementUpdated(el);
    const element = elements[0];
    mockRemoveProjectEvent(element);
    const obtained = el.shadowRoot.querySelectorAll('project-list-item');
    expect(obtained.length).to.equal(3);
  });
});
