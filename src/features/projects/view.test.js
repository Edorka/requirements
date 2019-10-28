import { html, fixture, expect } from '@open-wc/testing';
import { elementUpdated } from '@open-wc/testing-helpers';

import '../../../src/features/projects/view.js';

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

describe('<projects-view>', () => {

  it('should put no-projects text', async () => {
    const emptyProjects = [];
    const el = await fixture(html`
      <projects-view .projects=${[]}></projects-view>
    `);
    const obtained = el.shadowRoot.getElementById('no-projects-found');
    expect(obtained.textContent).to.equal('No projects');
  });

  it('or show one project', async () => {
    const oneProject = [
        {'title': 'First project'}
    ];
    const el = await fixture(html`
      <projects-view .projects=${[oneProject]}></projects-view>
    `);
    const obtained = el.shadowRoot.querySelectorAll('project-list-item');
    expect(obtained.length).to.equal(1);
  });

  it('creates project by event', async () => {
    const oneProject = [
        {'title': 'First project'}
    ];
    const el = await fixture(html`
      <projects-view .projects=${oneProject}></projects-view>
    `);
    mockCreateProjectEvent(el, 'A new project'); 
    await elementUpdated(el);
    const obtained = el.shadowRoot.querySelectorAll('project-list-item');
    expect(obtained.length).to.equal(2);
    expect(obtained[1].title).to.equal('A new project');
  });

  it('removed project by event', async () => {
    const projects = [
        {'title': 'First project'},
        {'title': 'Second project'},
        {'title': 'Third project'},
    ];
    const el = await fixture(html`
      <projects-view .projects=${projects}></projects-view>
    `);
    const items = el.shadowRoot.querySelectorAll('project-list-item');
    expect(items.length).to.equal(3);
    const item = items[0];
    mockRemoveProjectEvent(item);
    await elementUpdated(el);
    const obtained = el.shadowRoot.querySelectorAll('project-list-item');
    expect(obtained.length).to.equal(2);
  });

  it('wont hear creation events when disconnected', async () => {
    const projects = [
        {'title': 'First project'},
        {'title': 'Second project'},
        {'title': 'Third project'},
    ];
    const el = await fixture(html`
      <projects-view .projects=${projects}></projects-view>
    `);
    const items = el.shadowRoot.querySelectorAll('project-list-item');
    expect(items.length).to.equal(3);
    el.disconnectedCallback();
    mockCreateProjectEvent(el, 'Should not exist');
    await elementUpdated(el);
    const obtained = el.shadowRoot.querySelectorAll('project-list-item');
    expect(obtained.length).to.equal(3);
    const item = items[0];
    mockRemoveProjectEvent(item);
  });

  it('wont hear removal events when disconnected', async () => {
    const projects = [
        {'title': 'First project'},
        {'title': 'Second project'},
        {'title': 'Third project'},
    ];
    const el = await fixture(html`
      <projects-view .projects=${projects}></projects-view>
    `);
    const items = el.shadowRoot.querySelectorAll('project-list-item');
    expect(items.length).to.equal(3);
    el.disconnectedCallback();
    await elementUpdated(el);
    const item = items[0];
    mockRemoveProjectEvent(item);
    const obtained = el.shadowRoot.querySelectorAll('project-list-item');
    expect(obtained.length).to.equal(3);
  });
});
