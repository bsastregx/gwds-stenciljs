import { Component, Host, h, Prop, State } from '@stencil/core';
import textContrast from '../../utils/utils';

@Component({
  tag: 'gwds-look-at-me',
  styleUrl: 'gwds-look-at-me.scss',
  shadow: false,
})
export class GwLookAtMe {
  @Prop() bgColor: string = null;
  @Prop() preTitle: string = null;
  @Prop() mainTitle: string = null;
  @Prop() pt0: boolean = false; //padding-top:0
  @Prop() pb0: boolean = false; //padding-bottom:0
  @Prop() alignContent: 'left' | 'center' | 'right' = 'left';
  @Prop() bgImage: string = null;
  @Prop() bgSize: string = '1600px';
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
  @State() bgPosition: string = 'bottom right';
  @State() textColor: string = null;

  componentWillLoad() {
    //define this.rowClasses and this.colClasses css classes.
    if (this.alignContent === 'center') {
      this.rowClasses = 'row justify-content-md-center tac-md';
      this.colClasses = 'col-12 col-lg-8';
    } else if (this.alignContent === 'right') {
      this.rowClasses = 'row justify-content-md-end';
      this.colClasses = 'col-12 col-lg-7 col-xl-6';
    } else {
      //is left
      this.rowClasses = 'row';
      this.colClasses = 'col-12 col-lg-7 col-xl-6';
    }

    //define backgroundPosition
    if (this.alignContent === 'right') {
      this.bgPosition = 'bottom left';
    }

    //define text color based on contrast with the background
    this.textColor = textContrast(this.bgColor);
  }

  componentDidLoad() {}

  render() {
    return (
      <Host
        class={{ 'gwds-look-at-me': true }}
        style={{
          backgroundColor: `var(--gwds__color--${this.bgColor})`,
          backgroundImage: `url(${this.bgImage})`,
          backgroundSize: this.bgSize,
          backgroundPosition: this.bgPosition,
          color: `var(${this.textColor})`,
        }}
      >
        <section class={{ 'section': true, 'pt-0': this.pt0, 'pb-0': this.pb0 }}>
          <div
            class={{
              container: true,
            }}
          >
            <div class={this.rowClasses}>
              <div class={this.colClasses}>
                {this.preTitle ? <h3 class="h3 h3--light mt-0">{this.preTitle}</h3> : null}
                {this.mainTitle ? (
                  <h2
                    class={{
                      'h1': true,
                      'mt-0': !this.preTitle ? true : false,
                    }}
                  >
                    {this.mainTitle}
                  </h2>
                ) : null}
                <slot></slot>
                <div
                  class={{
                    'gwds-look-at-me__buttons-container': true,
                  }}
                >
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
          </div>
        </section>
      </Host>
    );
  }
}
