import { html, fixture, expect } from '@open-wc/testing';
import { elementUpdated, oneEvent } from '@open-wc/testing-helpers';
import './switch-by-url.js';
import { expressionFromPath } from './switch-by-url';

const activeOnes = item => item.active === true;

describe('<switch-by>', () => {
  it('should put default case', async () => {
    const el = await fixture(html`
      <switch-by>
        <switch-case defaults>hello</switch-case>
      </switch-by>
    `);
    window.location.path = '#/testing/';
    await elementUpdated(el);
    expect(el.children.length).to.equal(1);
    const children = Array.from(el.children);
    const activated = children.filter(activeOnes);
    expect(activated.length).to.equal(1);
    expect(activated[0].getAttribute('defaults')).to.not.equal(null);
  });

  it('should put default case from others', async () => {
    window.location.path = '/';
    const el = await fixture(html`
      <switch-by>
        <switch-case path=/"bye">bye</switch-case> 
        <switch-case path="/test"> this is a test </switch-case> 
        <switch-case defaults="true"><span>this is a test</span></switch-case> 
      </switch-by>
    `);
    await elementUpdated(el);
    window.location.hash = '#/unkown/';
    window.dispatchEvent(new Event('hashchange'));
    await elementUpdated(el);
    expect(el.children.length).to.equal(3);
    const children = Array.from(el.children);
    const activated = children.filter(activeOnes);
    expect(activated.length).to.equal(1);
    expect(activated[0].getAttribute('defaults')).to.not.equal(null);
  });

  it('should show test case from others', async () => {
    const el = await fixture(html`
      <switch-by>
        <switch-case path="/bye">Bye</switch-case>
        <switch-case path="/test">This is a test</switch-case>
        <switch-case defaults="true" path="/other">Other case</switch-case>
      </switch-by>
    `);
    const previous = el.shadowRoot.querySelectorAll('switch-case');
    window.location.hash = '#/test/';
    window.dispatchEvent(new Event('hashchange'));
    await elementUpdated(el);
    expect(el.children.length).to.equal(3);
    const children = Array.from(el.children);
    const activated = children.filter(activeOnes);
    expect(activated.length).to.equal(1);
    expect(activated[0].getAttribute('path')).to.equal('/test');
  });
});

describe('<switch-case>', () => {
  it('should not render if not active', async () => {
    const el = await fixture(html`
      <switch-case default><a>hello</a></switch-case>
    `);
    await elementUpdated(el);
    expect(el.shadowRoot.children.length).to.equal(0);
  });

  it('should render if active', async () => {
    const el = await fixture(html`
      <switch-case default><a>hello</a></switch-case>
    `);
    await elementUpdated(el);
    el.active = true;
    await elementUpdated(el);
    expect(el.shadowRoot.children.length).to.equal(1);
    expect(el.shadowRoot.querySelector('a').textContent).to.equal('hello');
  });

  it('should stop rendering if deactivated', async () => {
    const el = await fixture(html`
      <switch-case path="/hello"><a>hello</a></switch-case>
    `);
    await elementUpdated(el);
    el.active = true;
    await elementUpdated(el);
    expect(el.shadowRoot.children.length).to.equal(1);
    el.active = false;
    await elementUpdated(el);
    expect(el.shadowRoot.querySelectorAll('a').length).to.equal(0);
  });

  it('should pass url params to its children', async () => {
    const el = await fixture(html`
      <switch-case path="/hello/:id/test/:data"><sample>hello</sample></switch-case>
    `);
    const path = '/hello/1234/test/5678';
    await elementUpdated(el);
    el.matchs(path);
    el.active = true;
    await elementUpdated(el);
    const sample = el.shadowRoot.querySelector('sample');
    expect(sample.id).to.equal('1234');
    expect(sample.data).to.equal('5678');
  });
});

describe('expressionFromPath', () => {
  it('produce a expression for root', async () => {
    const expression = new RegExp('^/$');
    const path = '/';
    expect(expressionFromPath(path).source).to.equal(expression.source);
  });
  it('produce a expression for a path', async () => {
    const expression = new RegExp('^/testing/?$');
    const path = '/testing';
    const obtained = expressionFromPath(path);
    expect(obtained.source).to.equal(expression.source);
    expect(path.match(obtained)).to.not.equal(null);
  });
  it('produce a expression for a path', async () => {
    const expression = new RegExp('^/testing/?$');
    const path = '/testing';
    const obtained = expressionFromPath(path);
    expect(obtained.source).to.equal(expression.source);
    expect(path.match(obtained)).to.not.equal(null);
  });

  it('produce a expression for deep paths', async () => {
    const expression = new RegExp('^/testing/very/deep/?$');
    const path = '/testing/very/deep';
    const obtained = expressionFromPath(path);
    expect(obtained.source).to.equal(expression.source);
    expect(path.match(obtained)).to.not.equal(null);
    const pathWithTrail = path + '/';
    expect(pathWithTrail.match(obtained)).to.not.equal(null);
  });

  it('produce a expression for paths with a field', async () => {
    const expression = new RegExp('^/testing/(?<id>.*)/?$');
    const path = '/testing/:id';
    const obtained = expressionFromPath(path);
    expect(obtained.source).to.equal(expression.source);
    expect(path.match(obtained)).to.not.equal(null);
    const pathWithTrail = path + '/';
    expect(pathWithTrail.match(obtained)).to.not.equal(null);
  });

  it('produce a expression for paths with some fields', async () => {
    const expression = new RegExp('^/testing/(?<id>.*)/sub/(?<sub_id>.*)/?$');
    const path = '/testing/:id/sub/:sub_id';
    const samplePath = '/testing/123134-a/sub/555-aaa';
    const obtained = expressionFromPath(path);
    expect(obtained.source).to.equal(expression.source);
    expect(path.match(obtained)).to.not.equal(null);
    const pathWithTrail = path + '/';
    const result = obtained.exec(samplePath); //.match(obtained)
    expect(result).to.not.equal(null);
    expect(result.groups.id).to.equal('123134-a');
    expect(result.groups.sub_id).to.equal('555-aaa');
  });
});
