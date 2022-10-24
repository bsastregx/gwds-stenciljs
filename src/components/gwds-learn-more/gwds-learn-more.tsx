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
  //Button Primary
  @Prop() buttonPrimaryLabel: string = null;
  @Prop() buttonPrimaryUrl: string = null;
  @Prop() buttonPrimaryBlank: boolean = false;
  //Button Secondary
  @Prop() buttonSecondaryLabel: string = null;
  @Prop() buttonSecondaryUrl: string = null;
  @Prop() buttonSecondaryBlank: boolean = false;
  //Button Tertiary
  @Prop() buttonTertiaryLabel: string = null;
  @Prop() buttonTertiaryUrl: string = null;
  @Prop() buttonTertiaryBlank: boolean = false;

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
                {this.buttonPrimaryLabel && this.buttonPrimaryUrl ? (
                  <gwds-button label={this.buttonPrimaryLabel} type="primary" url={this.buttonPrimaryUrl} blank={this.buttonPrimaryBlank ? true : false}></gwds-button>
                ) : null}
                {this.buttonSecondaryLabel && this.buttonSecondaryUrl ? (
                  <gwds-button label={this.buttonSecondaryLabel} type="secondary" url={this.buttonSecondaryUrl} blank={this.buttonSecondaryBlank ? true : false}></gwds-button>
                ) : null}
                {this.buttonTertiaryLabel && this.buttonTertiaryUrl ? (
                  <gwds-button label={this.buttonTertiaryLabel} type="tertiary" url={this.buttonTertiaryUrl} blank={this.buttonTertiaryBlank ? true : false}></gwds-button>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
