import { Component, Host, h, State, Element } from '@stencil/core';

@Component({
  tag: 'gwds-message',
  styleUrl: 'gwds-message.scss',
  shadow: false,
})
export class GwdsMessage {
  @Element() el: HTMLElement;
  container!: HTMLDivElement;

  @State() opacity0: boolean = false;
  @State() height0: boolean = false;

  setHeight() {
    const containerHeight = this.container.offsetHeight;
    this.el.style.height = containerHeight + 'px';
  }

  resizeObserverFunc() {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry) {
          this.setHeight();
        }
      }
    });
    resizeObserver.observe(this.container);
  }

  close() {
    this.opacity0 = true;
    setTimeout(() => {
      this.height0 = true;
    }, 200);
  }

  componentDidLoad() {
    this.setHeight();
    this.resizeObserverFunc();
  }

  render() {
    return (
      <Host class={{ 'gwds-alert': true, 'gwds-alert--opacity-0': this.opacity0, 'gwds-alert--height-0': this.height0 }}>
        <div ref={el => (this.container = el as HTMLDivElement)} class={{ 'gwds-alert__container': true }}>
          <p class={{ 'gwds-alert__message m-0': true }}>
            <slot />
          </p>

          <span class={{ 'gwds-alert__close': true }}>
            <div onClick={this.close.bind(this)} class={{ 'gwds-alert__close-cross-container': true }}>
              <span class={{ 'gwds-alert__close-cross': true }}>&times;</span>
            </div>
          </span>
        </div>
      </Host>
    );
  }
}
