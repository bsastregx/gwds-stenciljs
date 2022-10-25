import { Component, Host, h, Prop, State, Element } from '@stencil/core';
import textContrast from '../../utils/utils';

@Component({
  tag: 'gwds-stack',
  styleUrl: 'gwds-stack.scss',
  shadow: false,
})
export class GwdsStack {
  @Prop() bgColor: string = 'dark-100';
  @Prop() mainTitle: string = null;
  @Prop() description: string = null;

  @State() textColor: string = null;

  @Element() el: HTMLElement;

  slottedItems() {
    const buffer = [];
    const slottedContent = this.el.querySelectorAll('*');
    slottedContent.forEach(function (node) {
      const listItem = <li class="gwds-stack__item">{node.getAttribute('main-title')}</li>;
      buffer.push(listItem);
    });
    return buffer;
  }

  render() {
    return (
      <Host
        class={{
          'gwds-stack': true,
        }}
        style={{
          backgroundColor: `var(--gwds__color--${this.bgColor})`,
          color: `var(${this.textColor})`,
        }}
      >
        <section class="section">
          <div class={{ 'container': true, 'container--main': true }}>
            <div class="row">
              <div class="gwds-stack__col-left col-12 col-md-6 col-lg-5">
                <ul class="unstyled">{this.slottedItems()}</ul>
              </div>
              <div class="gwds-stack__col-right col-12 col-md-6 col-lg-7">
                <slot></slot>
              </div>
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
