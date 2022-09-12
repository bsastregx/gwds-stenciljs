import { Component, Host, h, Prop, State } from '@stencil/core';

@Component({
  tag: 'gwds-learn-more',
  styleUrl: 'gwds-learn-more.scss',
  shadow: false,
})
export class GwdsLearnMore {
  @Prop() bgColor: string = 'dark-100';
  @Prop() mainTitle: string = null;
  @Prop() whiteText: boolean = false;
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

  render() {
    return (
      <Host class={{ 'gwds-learn-more': true, 'white-text': this.whiteText }}>
        <section
          style={{
            backgroundColor: `var(--gwds__color--${this.bgColor})`,
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
              <div class={{ 'col col-12 col-lg-6': true }}>
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
                <p>
                  <slot></slot>
                </p>
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
