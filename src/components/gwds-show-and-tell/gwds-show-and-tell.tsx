import { Component, Host, h, Prop, State } from '@stencil/core';

@Component({
  tag: 'gwds-show-and-tell',
  styleUrl: 'gwds-show-and-tell.scss',
  shadow: false,
})
export class GwShowAndTell {
  @Prop() bgColor: string = null;
  @Prop() preTitle: string = null;
  @Prop() mainTitle: string = null;
  @Prop() whiteText: boolean = false;
  @Prop() pt0: boolean = false; //padding-top:0
  @Prop() pb0: boolean = false; //padding-bottom:0
  @Prop() alignContent: 'left' | 'right' = 'left';
  @Prop() imageUrl: string = null;
  @Prop() imageAlt: string = null;
  @State() rowClasses: string = null;
  @State() leftColClasses: string = null;
  @State() rightColClasses: string = null;

  componentWillLoad() {
    //define this.rowClasses and this.colClasses css classes.
    if (this.alignContent === 'right') {
      this.rowClasses = 'row justify-content-between';
      this.leftColClasses = 'col-12 col-lg-6 order-lg-2 d-flex align-items-center';
      this.rightColClasses = 'col-12 col-lg-5 d-flex align-items-center order-lg-1';
    } else {
      //is left
      this.rowClasses = 'row justify-content-between';
      this.leftColClasses = 'col-12 col-lg-6 order-lg-1';
      this.rightColClasses = 'col-12 col-lg-5 d-flex align-items-center order-lg-2';
    }
  }

  componentDidLoad() {}

  render() {
    return (
      <Host
        style={{
          backgroundColor: `var(--gwds__color--${this.bgColor})`,
        }}
        class={{ 'gwds__show-and-tell': true, 'white-text': this.whiteText }}
      >
        <section class={{ 'pt-0': this.pt0, 'pb-0': this.pb0 }}>
          <div class={{ container: true }}>
            <div class={this.rowClasses}>
              <div class={this.leftColClasses}>
                <div>
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
                </div>
              </div>
              <div class={this.rightColClasses}>{this.imageUrl ? <img class="image" src={this.imageUrl} alt={this.imageAlt}></img> : null}</div>
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
