import { Component, Host, h, Prop, State, Listen, Element } from '@stencil/core';
import { GwdsAccordionItem } from '../gwds-accordion-item/gwds-accordion-item';

@Component({
  tag: 'gwds-accordion',
  styleUrl: 'gwds-accordion.scss',
  shadow: true,
})
export class GwdsAccordion {
  @Element() el: HTMLElement;
  @State() pageJustLoaded: boolean = true;

  @Listen('accordionOpened')
  accordionOpenedHandler(event: CustomEvent<object>) {
    //close all opened accordions, except the one that emitted this event.
    const itemId = event.detail['id'];
    console.log('itemId', itemId);
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
  }

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
      <Host class={{ 'gwds-accordion': true }}>
        <slot></slot>
      </Host>
    );
  }
}
