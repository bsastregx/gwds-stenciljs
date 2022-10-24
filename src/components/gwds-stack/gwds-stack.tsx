import { Component, Host, h, Prop, State } from '@stencil/core';
import textContrast from '../../utils/utils';

@Component({
  tag: 'gwds-stack',
  styleUrl: 'gwds-stack.scss',
  shadow: true,
})
export class GwdsStack {
  @Prop() bgColor: string = 'dark-100';
  @Prop() mainTitle: string = null;
  @Prop() description: string = null;

  @State() textColor: string = null;

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
            <slot></slot>
          </div>
        </section>
      </Host>
    );
  }
}
