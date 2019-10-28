import { html, fixture, expect } from '@open-wc/testing';
import { elementUpdated, oneEvent } from '@open-wc/testing-helpers';
import './switch-by-url.js';
import { expressionFromPath } from './switch-by-url';



describe('<switch-by>', () => {

  it('should put default case', async () => {
    return
    const el = await fixture(html`
      <switch-by >
        <switch-case default>hello</switch-case> 
      </switch-by>
    `);
    console.log('instantiated', el);
    window.location.path = '#/testing/';
    console.log('awaiting for update');
    await elementUpdated(el);
    expect(el.shadowRoot.children.length).to.equal(1);
  });

  it('should put default case from others', async () => {
    window.location.path = '/';
    const el = await fixture(html`
      <switch-by>
        <switch-case path="bye">bye</switch-case> 
        <switch-case path="test"> this is a test </switch-case> 
        <switch-case defaults="true"><span>this is a test</span></switch-case> 
      </switch-by>
    `);
    await elementUpdated(el);
    window.location.hash = '#/unkown/';
    window.dispatchEvent(new Event('hashchange'));
    console.log('switch content', el.shadowRoot, el.__hash);
    await elementUpdated(el);
    const result = el.shadowRoot.querySelectorAll('switch-case.active');
    expect(result.length).to.equal(1);
    console.log('test result', result[0]);
    expect(result[0].getAttribute('defaults')).to.equal("true");
  });

  it('should show test case from others', async () => {
    window.location.path = '/';
    const el = await fixture(html`
      <switch-by>
        <switch-case path="/bye">Bye</switch-case> 
        <switch-case path="/test"><a>This is a test</a></switch-case> 
        <switch-case defaults="true" path="/other">Other case</switch-case> 
      </switch-by>
    `);
    await elementUpdated(el);
    window.location.hash = '#/test/';
    window.dispatchEvent(new Event('hashchange'));
    await elementUpdated(el);
    const result = el.shadowRoot.querySelectorAll('switch-case.active');
    expect(result.length).to.equal(1);
    console.log('test result', result);
    await elementUpdated(result[0]);
    expect(result[0].textContent).to.equal('This is a test');
  });
});

describe('expressionFromPath', () => {
  it('produce a expression for root', async () => {
      const expression = new RegExp('^/$');
      const path = '/';
      expect(expressionFromPath(path).source).to.equal(expression.source);
  });
  it('produce a expression for a path', async () => {
      const expression = new RegExp('^/testing\/?$');
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
      const expression = new RegExp('^/testing/(?<id>.*)\/?$');
      const path = '/testing/:id';
      const obtained = expressionFromPath(path);
      expect(obtained.source).to.equal(expression.source);
      expect(path.match(obtained)).to.not.equal(null);
      const pathWithTrail = path + '/';
      expect(pathWithTrail.match(obtained)).to.not.equal(null);
  });

  it('produce a expression for paths with some fields', async () => {
      const expression = new RegExp('^/testing/(?<id>.*)/sub/(?<sub_id>.*)\/?$');
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
