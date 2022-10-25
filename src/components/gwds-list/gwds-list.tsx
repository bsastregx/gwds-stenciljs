import { Component, Host, h, Prop, State } from '@stencil/core';
import textContrast from '../../utils/utils';

@Component({
  tag: 'gwds-list',
  styleUrl: 'gwds-list.scss',
  shadow: false,
})
export class GwdsList {
  @Prop() mainTitle: string = null;
  @Prop() description: string = null;
  @Prop() bgColor: string = null;

  @State() textColor: string = null;

  componentWillLoad() {
    //define text color based on contrast with the background
    this.textColor = textContrast(this.bgColor);
  }

  render() {
    return (
      <Host
        class={{
          'gwds-list': true,
        }}
      >
        <section
          class="section"
          style={{
            backgroundColor: `var(--gwds__color--${this.bgColor})`,
            color: `var(${this.textColor})`,
          }}
        >
          <div class="gwds-list__container container">
            {this.mainTitle ? <h1 class="gwds-list__title h2 mt-0 tac">{this.mainTitle}</h1> : null}
            <gwds-grid per-row="2">
              <slot></slot>
            </gwds-grid>
          </div>
        </section>
      </Host>
    );
  }
}
