import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'gwds-button',
  styleUrl: 'gwds-button.scss',
  shadow: false,
})
export class GwButton {
  @Prop() label: string = null;
  @Prop() type: 'primary' | 'secondary' | 'tertiary' = 'primary';
  @Prop() size: 'small' | 'regular' = 'regular';
  @Prop() url: string = null;
  @Prop() blank: boolean = false;

  render() {
    return (
      <Host class={{ 'gwds-button': true }}>
        <a
          tabindex="0"
          class={{
            'gwds-button__button': true,
            'gwds-button__button--primary': this.type === 'primary',
            'gwds-button__button--secondary': this.type === 'secondary',
            'gwds-button__button--tertiary': this.type === 'tertiary',
            'gwds-button__button--small': this.size === 'small',
            'gwds-button__button--regular': this.size === 'regular',
          }}
          href={this.url}
          target={this.blank ? '_blank' : '_self'}
        >
          {this.label}
        </a>
      </Host>
    );
  }
}
