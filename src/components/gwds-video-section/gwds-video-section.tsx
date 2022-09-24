import { Component, Host, h, Prop, State } from '@stencil/core';
import textContrast from '../../utils/utils';

@Component({
  tag: 'gwds-video-section',
  styleUrl: 'gwds-video-section.scss',
  shadow: false,
})
export class GwdsVideoSection {
  @Prop() bgColor: string = null;
  @Prop() mainTitle: string = null;
  @Prop() pt0: boolean = false; //padding-top:0
  @Prop() pb0: boolean = false; //padding-bottom:0
  @Prop() alignContent: 'left' | 'right' = 'left';
  @Prop() alignTop: boolean = false;
  @Prop() url: string = null;
  @Prop() source: 'youtube' | 'vimeo';
  @Prop() fullWidth: boolean = true;

  @State() rowClasses: string = null;
  @State() leftColClasses: string = null;
  @State() rightColClasses: string = null;
  @State() textColor: string = null;

  componentWillLoad() {
    //define this.rowClasses and this.colClasses css classes.
    if (this.alignContent === 'right') {
      this.rowClasses = 'row justify-content-between';
      this.leftColClasses = 'col-12 col-lg-5 order-lg-2 d-flex align-items-center';
      this.rightColClasses = 'col-12 col-lg-6 d-flex align-items-center order-lg-1';
    } else {
      //is left
      this.rowClasses = 'row justify-content-between';
      this.leftColClasses = 'col-12 col-lg-5 order-lg-1 d-flex align-items-center';
      this.rightColClasses = 'col-12 col-lg-6 d-flex align-items-center order-lg-2';
    }

    //define text color based on contrast with the background
    this.textColor = textContrast(this.bgColor);
  }

  componentDidLoad() {}

  render() {
    return (
      <Host
        class={{ 'gwds-video-section': true }}
        style={{
          backgroundColor: `var(--gwds__color--${this.bgColor})`,
          color: `var(${this.textColor})`,
        }}
      >
        <section>
          <div class="container">
            <div class={this.rowClasses}>
              <div class={this.leftColClasses}>
                <div
                  class={{
                    'gwds-video-section__content-wrapper': true,
                  }}
                >
                  {this.mainTitle ? <h2 class="h3 mt-0">{this.mainTitle}</h2> : null}
                  <slot></slot>
                </div>
              </div>
              <div class={this.rightColClasses}>
                <gwds-video url={this.url} fullWidth={this.fullWidth}></gwds-video>
              </div>
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
