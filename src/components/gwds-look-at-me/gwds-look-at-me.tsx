import { Component, Host, h, Prop, State } from '@stencil/core';

@Component({
  tag: 'gwds-look-at-me',
  styleUrl: 'gwds-look-at-me.scss',
  shadow: true,
})
export class GwLookAtMe {
  bgImageOneEl!: HTMLDivElement;
  bgImageTwoEl!: HTMLDivElement;
  bgImageThreeEl!: HTMLDivElement;
  bgImageFourEl!: HTMLDivElement;

  @Prop() bgColor: string = null;
  @Prop() preTitle: string = null;
  @Prop() mainTitle: string = null;
  @Prop() whiteText: boolean = false;
  @Prop() pT0: boolean = false; //padding-top:0
  @Prop() pB0: boolean = false; //padding-bottom:0
  @Prop() alignContent: 'left' | 'center' | 'right' = 'left';
  @Prop() bgImage: string = null;
  @Prop() bgImageOne: string = null;
  @Prop() bgImageTwo: string = null;
  @Prop() bgImageThree: string = null;
  @Prop() bgImageFour: string = null;
  @Prop() bgSize: string = '1600px';
  @Prop() test: string = null;
  @State() rowClasses: string = null;
  @State() colClasses: string = null;
  @State() bgPosition: string = 'bottom right';

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
  }

  render() {
    return (
      <Host
        style={{
          backgroundColor: `var(--gwds-color-${this.bgColor})`,
          backgroundImage: `url(${this.bgImage})`,
          backgroundSize: this.bgSize,
          backgroundPosition: this.bgPosition,
        }}
        class={{ 'white-text': this.whiteText }}
      >
        <section
          class={{
            'container': true,
            'pt-0': this.pT0,
            'pb-0': this.pB0,
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
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
