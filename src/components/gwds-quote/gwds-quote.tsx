import { Component, Host, h, Prop, State } from '@stencil/core';
import textContrast from '../../utils/utils';

@Component({
  tag: 'gwds-quote',
  styleUrl: 'gwds-quote.scss',
  shadow: false,
})
export class GwdsQuote {
  @Prop() bgColor: string = null;
  @Prop() whiteText: boolean = false;
  @Prop() cite: string = null;
  @Prop() imageUrl: string = null;
  @Prop() imageAlt: string = null;
  @Prop() personLocation: string = null;
  @Prop() personName: string = null;
  @Prop() centerVertical: boolean = false;

  @State() textColor: string = null;

  componentWillLoad() {
    //define text color based on contrast with the background
    this.textColor = textContrast(this.bgColor);
  }

  render() {
    return (
      <Host
        class={{ 'gwds-quote': true, 'white-text': this.whiteText }}
        style={{
          backgroundColor: `var(--gwds__color--${this.bgColor})`,
          color: `var(${this.textColor})`,
        }}
      >
        <section>
          <div class="container">
            <div class="row">
              <div class="col d-flex">
                <div class="gwds-quote__left d-none d-lg-block">
                  <div class="gwds-quote__image-wrapper">
                    <img class="gwds-quote__image" src={this.imageUrl} alt={this.imageAlt} />
                  </div>
                </div>
                <div
                  class={{
                    'gwds-quote__right': true,
                    'd-flex': this.centerVertical,
                    'align-items-center': this.centerVertical,
                  }}
                >
                  <div>
                    <blockquote cite={this.cite} class="gwds-quote__quote">
                      <p class="m-0">
                        <slot></slot>
                      </p>
                      {this.personName || this.personLocation ? (
                        <footer class={{ 'gwds-quote__footer': true, 'd-flex': true, 'align-items-center': true }}>
                          <div class="gwds-quote__footer-left d-lg-none">
                            <div class="gwds-quote__image-wrapper">
                              <img class="gwds-quote__image" src={this.imageUrl} alt={this.imageAlt} />
                            </div>
                          </div>
                          <div class="gwds-quote__footer-right">
                            {this.personName ? <small class="gwds-quote__person-data gwds-quote__person-data--name">{this.personName}</small> : null}
                            {this.personLocation ? <small class="gwds-quote__person-data gwds-quote__person-data--location">{this.personLocation}</small> : null}
                          </div>
                        </footer>
                      ) : null}
                    </blockquote>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
