import { html, fixture, expect } from '@open-wc/testing';
import { elementUpdated } from '@open-wc/testing-helpers';
import fetchMock from 'fetch-mock';
import './index.js';

const APIHost = 'http://localhost:3000';
fetchMock.config.sendAsJson = true;


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

  it('should show project\'s title after loading', async () => {
    const data = {
        'title': 'A test',
        'requirements': []
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
    expect(title.textContent).to.equal('A test');
  });
});
