import { Component, Host, h, Prop, State, Element } from '@stencil/core';
import textContrast from '../../utils/utils';
import { GwdsStackItem } from '../gwds-stack-item/gwds-stack-item';

@Component({
  tag: 'gwds-stack-2',
  styleUrl: 'gwds-stack.scss',
  shadow: false,
})
export class GwdsStack2 {
  @Prop() bgColor: string = 'dark-100';
  @Prop() mainTitle: string = null;
  @Prop() description: string = null;
  @Prop() pt0: boolean = false;
  @Prop() pb0: boolean = false;

  @State() textColor: string = null;
  @State() slottedContent: NodeList = null;

  @Element() el: HTMLElement;

  rightCol!: HTMLElement;

  componentWillLoad() {
    //define text color based on contrast with the background
    this.textColor = textContrast(this.bgColor);
  }

  componentDidLoad() {}

  clickHandler(index) {
    const items = this.rightCol.querySelectorAll('gwds-stack-item');
    items.forEach(function (node, index2) {
      if (index === index2) {
        (node as unknown as GwdsStackItem).visible = true;
      } else {
        (node as unknown as GwdsStackItem).visible = false;
      }
    });
  }

  render() {
    return (
      <Host
        class={{
          'gwds-stack': true,
        }}
        style={{
          backgroundColor: `var(--gwds__color--${this.bgColor})`,
          color: `var(${this.textColor})`,
        }}
      >
        <section class={{ 'section': true, 'pt-0': this.pt0, 'pb-0': this.pb0 }}>
          <div class={{ 'container': true, 'container--main': true }}>
            <div class="row">
              <div class="col-12 col-lg-8 offset-lg-2 tac">
                <h2 class="h2">What's new in GeneXus 18?</h2>
                <p class="paragraph">
                  GeneXus 18 accompanies technological advances to provide the best experience in Web and Mobile platforms to companies, developers and end users.
                </p>
              </div>
            </div>
            <div class="row">
              <div class="gwds-stack__col-left col-12 col-md-6 col-lg-5">
                <ul class="unstyled">
                  <li
                    on-click={this.clickHandler.bind(this, 0)}
                    class="gwds-stack__item"
                    style={{
                      borderColor: `var(${this.textColor})`,
                    }}
                  >
                    GeneXus Training
                  </li>
                  <li
                    on-click={this.clickHandler.bind(this, 1)}
                    class="gwds-stack__item"
                    style={{
                      borderColor: `var(${this.textColor})`,
                    }}
                  >
                    GeneXus Webinars
                  </li>
                  <li
                    on-click={this.clickHandler.bind(this, 2)}
                    class="gwds-stack__item"
                    style={{
                      borderColor: `var(${this.textColor})`,
                    }}
                  >
                    GeneXus Community Wiki
                  </li>
                  <li
                    on-click={this.clickHandler.bind(this, 3)}
                    class="gwds-stack__item"
                    style={{
                      borderColor: `var(${this.textColor})`,
                    }}
                  >
                    GeneXus Beta Channel
                  </li>
                </ul>
              </div>
              <div class="gwds-stack__col-right col-12 col-md-6 col-lg-7" ref={el => (this.rightCol = el as HTMLElement)}>
                <gwds-stack-item
                  visible
                  main-title="GeneXus Training"
                  icon-url="../assets/images/stack/stack-gx18-all-canal-beta.svg"
                  button-label="Start now"
                  button-url="www.google.com"
                >
                  Training portal with self-study options and teaching support. Here you will also find the worldwide calendar of courses and certifications.
                </gwds-stack-item>
                <gwds-stack-item main-title="GeneXus Webinars" icon-url="../assets/images/stack/stack-gx18-all-webinars.svg" button-label="Start now" button-url="www.google.com">
                  Online sessions on technology and current topics, led by GeneXus Community experts and partners.
                </gwds-stack-item>
                <gwds-stack-item main-title="GeneXus Community Wiki" icon-url="../assets/images/stack/stack-gx18-all-wiki.svg" button-label="Start now" button-url="www.google.com">
                  Training portal with self-study options and teaching support. Here you will also find the worldwide calendar of courses and certifications.
                </gwds-stack-item>
                <gwds-stack-item
                  main-title="GeneXus Beta Channel"
                  icon-url="../assets/images/stack/stack-gx18-all-canal-beta.svg"
                  button-label="Start now"
                  button-url="www.google.com"
                >
                  Test GeneXus features, products and all new technologies before they are released.
                </gwds-stack-item>
              </div>
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
