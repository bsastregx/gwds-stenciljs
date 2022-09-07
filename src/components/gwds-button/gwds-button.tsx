import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'gwds-button',
  styleUrl: 'gwds-button.scss',
  shadow: true,
})
export class GwButton {
  @Prop() label: string = null;
  @Prop() type: 'primary' | 'secondary' | 'tertiary' = 'primary';
  @Prop() size: 'small' | 'regular' = 'regular';
  @Prop() url: string = null;
  @Prop() blank: boolean = false;

  render() {
    return (
      <Host>
        <a
          tabindex="0"
          class={{
            'button': true,
            'button--primary': this.type === 'primary',
            'button--secondary': this.type === 'secondary',
            'button--tertiary': this.type === 'tertiary',
            'button--small': this.size === 'small',
            'button--regular': this.size === 'regular',
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
