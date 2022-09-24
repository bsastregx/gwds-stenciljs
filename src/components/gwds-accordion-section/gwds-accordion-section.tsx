import { Component, Host, h, Prop, State } from '@stencil/core';

@Component({
  tag: 'gwds-accordion-section',
  styleUrl: 'gwds-accordion-section.scss',
  shadow: false,
})
export class GwdsAccordionSection {
  @Prop() bgColor: string = null;
  @Prop() mainTitle: string = null;
  @Prop() pt0: boolean = false; //padding-top:0
  @Prop() pb0: boolean = false; //padding-bottom:0

  @State() textColor: string = null;

  render() {
    return (
      <Host
        class={{ 'gwds-video-section': true }}
        style={{
          backgroundColor: `var(--gwds__color--${this.bgColor})`,
          color: `var(${this.textColor})`,
        }}
      >
        <section class="section">
          <div class="container">
            <div class="row">
              <div class="col-12 col-md-5">
                <h2 class="h2 mt-0">{this.mainTitle}</h2>
              </div>
              <div class="col-12 col-md-6 offset-md-1">
                <slot></slot>
              </div>
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
