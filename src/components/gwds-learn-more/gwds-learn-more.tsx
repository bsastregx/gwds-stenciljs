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
  @Prop() bpLabel: string = null;
  @Prop() bpUrl: string = null;
  @Prop() bpBlank: boolean = false;
  //Button Secondary
  @Prop() bsLabel: string = null;
  @Prop() bsUrl: string = null;
  @Prop() bsBlank: boolean = false;

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
                {this.bpLabel && this.bpUrl ? <gwds-button label={this.bpLabel} type="primary" blank={this.bpBlank ? true : false}></gwds-button> : null}
                {this.bsLabel && this.bsUrl ? <gwds-button label={this.bsLabel} type="secondary" blank={this.bsBlank ? true : false}></gwds-button> : null}
              </div>
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
