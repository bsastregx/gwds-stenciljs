import { Component, Host, h, Prop, State, Event, EventEmitter, Watch } from '@stencil/core';

@Component({
  tag: 'gwds-accordion-item',
  styleUrl: 'gwds-accordion-item.scss',
  shadow: false,
})
export class GwdsAccordionItem {
  @Event() accordionOpened: EventEmitter<object>;

  accordionCollapse!: HTMLDivElement;
  accordionBody!: HTMLDivElement;

  @Prop({ reflect: true, mutable: true }) active: boolean = false;
  @Prop({ reflect: true, mutable: true }) itemId: string = null; //for internal use
  @Prop() itemTitle: string = null;

  @State() accordionCollapseHeight: string = '0';

  componentWillLoad() {
    this.itemId = this.itemTitle.replace(/\s/g, '-');
  }

  componentDidLoad() {
    this.active ? (this.accordionCollapseHeight = this.accordionBody.offsetHeight + 'px') : null;
  }

  closeAccordion() {
    this.accordionCollapseHeight = '0';
  }

  openAccordion() {
    this.accordionOpened.emit({ id: this.itemId });
    this.accordionCollapseHeight = this.accordionBody.offsetHeight + 'px';
  }

  toggleAccordion() {
    if (this.active) {
      this.active = false;
    } else {
      this.active = true;
    }
  }

  @Watch('active')
  watchActiveHandler(newValue: boolean) {
    if (newValue) {
      this.openAccordion();
    } else {
      this.closeAccordion();
    }
  }

  render() {
    return (
      <Host class={{ 'gwds-accordion-item': true, 'gwds-accordion-item--active': this.active }}>
        <header class={{ 'gwds-accordion-item__header': true }}>
          <button class={{ 'gwds-accordion-item__button': true }} onClick={this.toggleAccordion.bind(this)}>
            {this.itemTitle}
            <span class={{ 'gwds-accordion-item__plusminus': true }}></span>
          </button>
        </header>
        <div ref={el => (this.accordionCollapse = el as HTMLDivElement)} class={{ 'gwds-accordion-item__collapse': true }} style={{ height: this.accordionCollapseHeight }}>
          <div ref={el => (this.accordionBody = el as HTMLDivElement)} class={{ 'gwds-accordion-item__body': true }}>
            <slot></slot>
          </div>
        </div>
      </Host>
    );
  }
}
