import { Component, Host, h, Prop, State, Element } from '@stencil/core';
import textContrast from '../../utils/utils';
import { marked } from 'marked';

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
  @Prop() description: string = null;
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
  @State() bgPosition: string = 'bottom right';
  @State() textColor: string = null;

  @Element() el: HTMLElement;

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
                {this.description ? <div innerHTML={marked.parse(this.description)}></div> : <slot></slot>}
                <div
                  class={{
                    'gwds-look-at-me__buttons-container': true,
                  }}
                >
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
          </div>
        </section>
      </Host>
    );
  }
}
