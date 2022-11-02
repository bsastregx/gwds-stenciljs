import { Component, Host, h, State, Listen, Element, Prop } from '@stencil/core';
import { GwdsAccordionItem } from '../gwds-accordion-item/gwds-accordion-item';
import textContrast from '../../utils/utils';

@Component({
  tag: 'gwds-accordion',
  styleUrl: 'gwds-accordion.scss',
  shadow: false,
})
export class GwdsAccordion {
  @Prop() bgColor: string = null;
  @Prop() mainTitle: string = null;
  @Prop() pt0: boolean = false; //padding-top:0
  @Prop() pb0: boolean = false; //padding-bottom:0

  @Element() el: HTMLElement;

  @State() textColor: string = null;
  @State() pageJustLoaded: boolean = true; //This will prevent the accordion to collapse when resizeObserver is called on page load.

  @Listen('accordionOpened')
  accordionOpenedHandler(event: CustomEvent<object>) {
    //close all opened accordions, except the one that emitted this event.
    const itemId = event.detail['id'];
    const accordionItems = this.el.querySelectorAll('gwds-accordion-item');

    accordionItems.forEach(item => {
      if ((item as unknown as GwdsAccordionItem).itemId !== itemId) {
        if ((item as unknown as GwdsAccordionItem).active) {
          (item as unknown as GwdsAccordionItem).active = false;
        }
      }
    });
  }

  componentWillLoad() {
    this.resizeObserver();

    //define text color based on contrast with the background
    this.textColor = textContrast(this.bgColor);
    //define --accordion-text-color var equal to this.textColor, for styling the "+/-" color.
    this.el.style.setProperty('--accordion-text-color', `var(${this.textColor})`);
  }

  componentDidLoad() {}

  resizeObserver() {
    let prevWidth = 0;
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        //this.closeAccordions();
        const width = entry.borderBoxSize?.[0].inlineSize;
        if (typeof width === 'number' && width !== prevWidth) {
          prevWidth = width;
          if (this.pageJustLoaded) {
            this.pageJustLoaded = false;
            return;
          } else {
            this.closeAccordions();
          }
        }
      }
    });
    resizeObserver.observe(this.el);
  }

  closeAccordions() {
    const accordionItems = this.el.querySelectorAll('gwds-accordion-item');
    accordionItems.forEach(item => {
      if ((item as unknown as GwdsAccordionItem).active) {
        (item as unknown as GwdsAccordionItem).active = false;
      }
    });
  }

  render() {
    return (
      <Host
        class={{ 'gwds-accordion': true }}
        style={{
          backgroundColor: `var(--gwds__color--${this.bgColor})`,
          color: `var(${this.textColor})`,
        }}
      >
        <section class="section">
          <div class="container">
            <div class="row">
              <div class="col-12 col-lg-6">{this.mainTitle ? <h2 class="h2">{this.mainTitle}</h2> : null}</div>
              <div class="col-12 col-lg-6">
                <slot></slot>
              </div>
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
