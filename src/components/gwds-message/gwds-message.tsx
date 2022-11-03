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
  wrapper!: HTMLDivElement;

  @State() opacity0: boolean = false;
  @State() height0: boolean = false;
  @State() textColor: string = null;

  setHeight() {
    const wrapperHeight = this.wrapper.offsetHeight;
    this.el.style.height = wrapperHeight + 'px';
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
        <div ref={el => (this.wrapper = el as HTMLDivElement)} class="gwds-message__wrapper">
          <div class={{ 'gwds-message__container': true }}>
            <p class={{ 'gwds-message__message m-0': true }}>
              <slot />
            </p>

            <div class="gwds-message__link-button-container">
              {this.linkUrl && this.linkLabel ? (
                <a class="gwds-message__link" href={this.linkUrl}>
                  {this.linkLabel}
                </a>
              ) : null}
              {this.buttonLabel && this.buttonUrl ? <gwds-button class="gwds-message__button" label={this.buttonLabel} url={this.buttonUrl} size="small"></gwds-button> : null}
            </div>
          </div>
          <span onClick={this.close.bind(this)} class={{ 'gwds-message__close': true }}>
            <gwds-icon src="/assets/icons/times.svg"></gwds-icon>
          </span>
        </div>
      </Host>
    );
  }
}
