import { html, fixture, expect } from '@open-wc/testing';
import { elementUpdated } from '@open-wc/testing-helpers';
import fetchMock from 'fetch-mock';
import './index.js';

const APIHost = 'http://localhost:3000';
fetchMock.config.sendAsJson = true;

const onlyContent = element => element.textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim();

describe('<requirements-feature>', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should put loading while no data ', async () => {
    const el = await fixture(html`
      <requirements-feature></requirements-feature>
    `);
    await elementUpdated(el);
    const obtained = el.shadowRoot.getElementById('loading-project');
    expect(obtained.textContent).to.equal('Loading...');
  });

  it("should show project's title and requirements after loading", async () => {
    const data = {
      title: 'A test',
      requirements: [
        { id: 1, title: 'First requirement', requirements: [] },
        { id: 2, title: 'Second requirement', requirements: [] },
        { id: 3, title: 'Third requirement', requirements: [] },
      ],
    };
    const mock = fetchMock.get(APIHost + '/projects/1', data);
    const el = await fixture(html`
      <requirements-feature .id=${1}></requirements-feature>
    `);
    await elementUpdated(el);
    await mock.flush();
    await elementUpdated(el);
    const wrapper = el.shadowRoot.getElementById('project-wrapper');
    expect(wrapper).to.not.equal(null);
    const title = wrapper.querySelector('.title');
    expect(title).to.not.equal(null);
    expect(onlyContent(title)).to.equal('A test');
    const requirements = wrapper.querySelectorAll('project-requirement');
    expect(requirements.length).to.equal(3);
  });
  it("should show project's title, requirements may be undefined", async () => {
    const data = {
      title: 'A test'
    };
    const mock = fetchMock.get(APIHost + '/projects/1', data);
    const el = await fixture(html`
      <requirements-feature .id=${1}></requirements-feature>
    `);
    await elementUpdated(el);
    await mock.flush();
    await elementUpdated(el);
    const wrapper = el.shadowRoot.getElementById('project-wrapper');
    const requirements = wrapper.querySelectorAll('project-requirement');
    expect(requirements.length).to.equal(0);
  });


  it('should show generic error', async () => {
    const error = { error: true, reason: 'something went wrong' };
    const mock = fetchMock.mock(APIHost + '/projects/1', {
      body: JSON.stringify({ error: true }),
      status: 500,
    });
    const el = await fixture(html`
      <requirements-feature .id=${1}></requirements-feature>
    `);
    await mock.flush();
    await elementUpdated(el);
    const reports = el.shadowRoot.querySelector('.error');
    expect(onlyContent(reports)).to.equal("Error: can't load project");
  });

  it("should show error's reason ", async () => {
    const error = { error: true, reason: 'something went wrong' };
    const mock = fetchMock.mock(APIHost + '/projects/1', {
      body: JSON.stringify({ error: true, reason: 'Project [1] was not found' }),
      status: 404,
    });
    const el = await fixture(html`
      <requirements-feature .id=${1}></requirements-feature>
    `);
    await mock.flush();
    await elementUpdated(el);
    const reports = el.shadowRoot.querySelector('.error');
    expect(onlyContent(reports)).to.equal('Error: Project [1] was not found');
  });

  it('should add new sub-requirements on event', async () => {
    const data = {
      title: 'A test',
      requirements: [
        { id: 1, title: 'First requirement', requirements: [] },
        { id: 2, title: 'Second requirement', requirements: [] },
        { id: 3, title: 'Third requirement', requirements: [] },
      ],
    };
    const mock = fetchMock.get(APIHost + '/projects/1', {
        body: JSON.stringify(data),
        status: 200, 
    });
    const el = await fixture(html`
      <requirements-feature .id=${1}></requirements-feature>
    `);
    await elementUpdated(el);
    await mock.flush();
    await elementUpdated(el);
   let requirements = el.shadowRoot.querySelectorAll('project-requirement');
   expect(requirements.length).to.equal(3);
   const bubbles = true;
   const detail = {
       done: true,
       requirement: {
           id: 1, title: 'Expected title', projectId: 123, parentId: 321
       }
   };
    const created = new CustomEvent('requirement-created', {bubbles, detail});
    const source = el.shadowRoot.querySelector('create-requirement');
    el.shadowRoot.dispatchEvent(created);
   await elementUpdated(el);
   requirements = el.shadowRoot.querySelectorAll('project-requirement');
   expect(requirements.length).to.equal(4);
  });

  it('should ignore sub-requirements on event failed', async () => {
    const data = {
      title: 'A test',
      requirements: [
        { id: 1, title: 'First requirement', requirements: [] },
        { id: 2, title: 'Second requirement', requirements: [] },
        { id: 3, title: 'Third requirement', requirements: [] },
      ],
    };
    const mock = fetchMock.get(APIHost + '/projects/1', {
        body: JSON.stringify(data),
        status: 200, 
    });
    const el = await fixture(html`
      <requirements-feature .id=${1}></requirements-feature>
    `);
    await elementUpdated(el);
    await mock.flush();
    await elementUpdated(el);
   let requirements = el.shadowRoot.querySelectorAll('project-requirement');
   expect(requirements.length).to.equal(3);
   const bubbles = true;
   const detail = {
       error: true,
       reason: 'title is empty'
   };
    const created = new CustomEvent('requirement-created', {bubbles, detail});
    const source = el.shadowRoot.querySelector('create-requirement');
    el.shadowRoot.dispatchEvent(created);
   await elementUpdated(el);
   requirements = el.shadowRoot.querySelectorAll('project-requirement');
   expect(requirements.length).to.equal(3);
  });
});
