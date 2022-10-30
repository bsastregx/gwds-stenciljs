import { Component, Host, h, State, Prop, Element } from '@stencil/core';
import textContrast from '../../utils/utils';

@Component({
  tag: 'gwds-message',
  styleUrl: 'gwds-message.scss',
  shadow: false,
})
export class GwdsMessage {
  @Prop() bgColor: string = 'red-50';
  @Prop() fixed: boolean = false;
  @Prop() linkLabel: string = null;
  @Prop() linkUrl: string = null;
  @Prop() linkTarget: '_blank' | '_self' = '_self';
  @Prop() buttonLabel: string = null;
  @Prop() buttonUrl: string = null;
  @Prop() buttonTarget: '_blank' | '_self' = '_self';

  @Element() el: HTMLElement;
  container!: HTMLDivElement;

  @State() opacity0: boolean = false;
  @State() height0: boolean = false;
  @State() textColor: string = null;

  setHeight() {
    const containerHeight = this.container.offsetHeight;
    this.el.style.height = containerHeight + 'px';
  }

  close() {
    this.setHeight();
    this.opacity0 = true;
    setTimeout(() => {
      this.height0 = true;
    }, 200);
  }

  componentWillLoad() {
    //define text color based on contrast with the background
    this.textColor = textContrast(this.bgColor);
  }

  render() {
    return (
      <Host
        class={{ 'gwds-message': true, 'gwds-message--opacity-0': this.opacity0, 'gwds-message--height-0': this.height0, 'gwds-message--fixed': this.fixed }}
        style={{
          backgroundColor: `var(--gwds__color--${this.bgColor})`,
          color: `var(${this.textColor})`,
        }}
      >
        <div ref={el => (this.container = el as HTMLDivElement)} class={{ 'gwds-message__container': true }}>
          <p class={{ 'gwds-message__message m-0': true }}>
            <slot />
            {this.linkUrl && this.linkLabel ? <a href={this.linkUrl}>{this.linkLabel}</a> : null}
          </p>

          <span class={{ 'gwds-message__close': true }}>
            <div onClick={this.close.bind(this)} class={{ 'gwds-message__close-cross-container': true }}>
              <span class={{ 'gwds-message__close-cross': true }}>&times;</span>
            </div>
          </span>
        </div>
      </Host>
    );
  }
}
