import { Component, Host, h, Prop, State } from '@stencil/core';
import textContrast from '../../utils/utils';

@Component({
  tag: 'gwds-show-and-tell',
  styleUrl: 'gwds-show-and-tell.scss',
  shadow: false,
})
export class GwShowAndTell {
  @Prop() bgColor: string = null;
  @Prop() preTitle: string = null;
  @Prop() mainTitle: string = null;
  @Prop() pt0: boolean = false; //padding-top:0
  @Prop() pb0: boolean = false; //padding-bottom:0
  @Prop() alignContent: 'left' | 'right' = 'left';
  @Prop() imageUrl: string = null;
  @Prop() imageAlt: string = null;
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
  @State() leftColClasses: string = null;
  @State() rightColClasses: string = null;
  @State() textColor: string = null;

  componentWillLoad() {
    //define this.rowClasses and this.colClasses css classes.
    if (this.alignContent === 'right') {
      this.rowClasses = 'row justify-content-between';
      this.leftColClasses = 'col-12 col-lg-6 d-flex align-items-center order-lg-2';
      this.rightColClasses = 'col-12 col-lg-5 d-flex align-items-center order-lg-1';
    } else {
      //is left
      this.rowClasses = 'row justify-content-between';
      this.leftColClasses = 'col-12 col-lg-6 d-flex align-items-center order-lg-1';
      this.rightColClasses = 'col-12 col-lg-5 d-flex align-items-center order-lg-2';
    }

    //define text color based on contrast with the background
    this.textColor = textContrast(this.bgColor);
  }

  componentDidLoad() {}

  render() {
    return (
      <Host
        style={{
          backgroundColor: `var(--gwds__color--${this.bgColor})`,
          color: `var(${this.textColor})`,
        }}
        class={{ 'gwds-show-and-tell': true }}
      >
        <section class={{ 'pt-0': this.pt0, 'pb-0': this.pb0, 'section': true }}>
          <div class={{ container: true }}>
            <div class={this.rowClasses}>
              <div class={this.leftColClasses}>
                <div
                  class={{
                    'gwds-show-and-tell__content-wrapper': true,
                  }}
                >
                  {this.preTitle ? <h3 class="h4 h4--light mt-0">{this.preTitle}</h3> : null}
                  {this.mainTitle ? (
                    <h2
                      class={{
                        'h3': true,
                        'mt-0': !this.preTitle ? true : false,
                      }}
                    >
                      {this.mainTitle}
                    </h2>
                  ) : null}
                  <slot></slot>
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
              <div class={this.rightColClasses}>{this.imageUrl ? <img class="gwds-show-and-tell__image" src={this.imageUrl} alt={this.imageAlt} loading="lazy"></img> : null}</div>
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
