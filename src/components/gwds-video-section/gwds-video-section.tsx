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

  //First Button
  @Prop() firstButtonLabel: string = null;
  @Prop() firstButtonUrl: string = null;
  @Prop() firstButtonType: 'primary' | 'secondary' | 'tertiary' = 'primary';
  @Prop() firstButtonTarget: '_blank' | '_self' = '_self';
  //Second Button
  @Prop() secondButtonLabel: string = null;
  @Prop() secondButtonUrl: string = null;
  @Prop() secondButtonType: 'primary' | 'secondary' | 'tertiary' = 'primary';
  @Prop() secondButtonTarget: '_blank' | '_self' = '_self';
  //Third Button
  @Prop() thirdButtonLabel: string = null;
  @Prop() thirdButtonUrl: string = null;
  @Prop() thirdButtonType: 'primary' | 'secondary' | 'tertiary' = 'primary';
  @Prop() thirdButtonTarget: '_blank' | '_self' = '_self';

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
        class={{ 'gwds-video-section': true, 'section': true, 'pt-0': this.pt0, 'pb-0': this.pb0 }}
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
                  {this.firstButtonLabel && this.firstButtonUrl ? (
                    <gwds-button label={this.firstButtonLabel} type={this.firstButtonType} url={this.firstButtonUrl} target={this.firstButtonTarget}></gwds-button>
                  ) : null}
                  {this.secondButtonLabel && this.secondButtonUrl ? (
                    <gwds-button label={this.secondButtonLabel} type={this.secondButtonType} url={this.secondButtonUrl} target={this.secondButtonTarget}></gwds-button>
                  ) : null}
                  {this.thirdButtonLabel && this.thirdButtonUrl ? (
                    <gwds-button label={this.thirdButtonLabel} type={this.thirdButtonType} url={this.thirdButtonUrl} target={this.thirdButtonTarget}></gwds-button>
                  ) : null}
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
