import { Component, Host, h, Prop, State, Element } from '@stencil/core';
import textContrast from '../../utils/utils';
import { GwdsStackItem } from '../gwds-stack-item/gwds-stack-item';

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
  @State() slottedContent: NodeList = null;

  @Element() el: HTMLElement;

  componentWillLoad() {
    //define text color based on contrast with the background
    this.textColor = textContrast(this.bgColor);
  }

  slottedItems() {
    const buffer = [];
    this.slottedContent = this.el.querySelectorAll('*');
    this.slottedContent.forEach(
      function (node, index) {
        const listItem = (
          <li onClick={this.clickHandler.bind(this, index)} class="gwds-stack__item">
            {node.getAttribute('main-title')}
          </li>
        );
        buffer.push(listItem);
      }.bind(this),
    );
    return buffer;
  }

  clickHandler(index) {
    this.slottedContent.forEach(function (node, index2) {
      if (index === index2) {
        (node as unknown as GwdsStackItem).visible = true;
      } else {
        (node as unknown as GwdsStackItem).visible = false;
      }
    });
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
