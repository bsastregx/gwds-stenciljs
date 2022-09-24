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
  @Prop() bpLabel: string = null;
  @Prop() bpUrl: string = null;
  @Prop() bpBlank: boolean = false;
  //Button Secondary
  @Prop() bsLabel: string = null;
  @Prop() bsUrl: string = null;
  @Prop() bsBlank: boolean = false;
  //Button Tertiary
  @Prop() btLabel: string = null;
  @Prop() btUrl: string = null;
  @Prop() btBlank: boolean = false;

  @State() rowClasses: string = null;
  @State() colClasses: string = null;
  @State() bgPosition: string = 'bottom right';
  @State() textColor: string = null;

  componentWillLoad() {
    //define this.rowClasses and this.colClasses css classes.
    if (this.alignContent === 'center') {
      this.rowClasses = 'row justify-content-md-center tac-md';
      this.colClasses = 'col-12 col-lg-7 col-xl-6';
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
        <section>
          <div
            class={{
              'container': true,
              'pt-0': this.pt0,
              'pb-0': this.pb0,
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
                  {this.bpLabel && this.bpUrl ? <gwds-button label={this.bpLabel} type="primary" blank={this.bpBlank ? true : false}></gwds-button> : null}
                  {this.bsLabel && this.bsUrl ? <gwds-button label={this.bsLabel} type="secondary" blank={this.bsBlank ? true : false}></gwds-button> : null}
                  {this.btLabel && this.btUrl ? <gwds-button label={this.btLabel} type="tertiary" blank={this.btBlank ? true : false}></gwds-button> : null}
                </div>
              </div>
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
