import { Component, Host, h, Prop, State } from '@stencil/core';
import textContrast from '../../utils/utils';

@Component({
  tag: 'gwds-learn-more',
  styleUrl: 'gwds-learn-more.scss',
  shadow: false,
})
export class GwdsLearnMore {
  @Prop() bgColor: string = 'dark-100';
  @Prop() mainTitle: string = null;
  @Prop() pt0: boolean = false; //padding-top:0
  @Prop() pb0: boolean = false; //padding-bottom:0
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
  @State() colClasses: string = null;
  @State() textColor: string = null;

  componentWillLoad() {
    //define text color based on contrast with the background
    this.textColor = textContrast(this.bgColor);
  }

  render() {
    return (
      <Host class={{ 'gwds-learn-more': true }}>
        <section
          class="section"
          style={{
            backgroundColor: `var(--gwds__color--${this.bgColor})`,
            color: `var(${this.textColor})`,
          }}
        >
          <div
            class={{
              'container': true,
              'pt-0': this.pt0,
              'pb-0': this.pb0,
            }}
          >
            <div class={{ 'row d-flex align-items-center': true }}>
              <div class={{ 'gwds-learn-more__col-left col col-12 col-lg-6': true }}>
                {this.mainTitle ? (
                  <h2
                    class={{
                      'h3': true,
                      'mt-0': true,
                    }}
                  >
                    {this.mainTitle}
                  </h2>
                ) : null}
                <slot></slot>
              </div>
              <div class={{ 'col col-12 col-lg-6 d-lg-flex justify-content-lg-end': true }}>
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
          </div>
        </section>
      </Host>
    );
  }
}
