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
  @Prop() target: '_blank' | '_self' = '_self';
  @Prop() m0: boolean = false;

  render() {
    return (
      <Host
        class={{
          'gwds-button': true,
          'gwds-button--primary': this.type === 'primary',
          'gwds-button--secondary': this.type === 'secondary',
          'gwds-button--tertiary': this.type === 'tertiary',
          'gwds-button--small': this.size === 'small',
          'gwds-button--regular': this.size === 'regular',
          'm-0': this.m0,
        }}
      >
        <a tabindex="0" class={{ 'gwds-button__button': true }} href={this.url} target={this.target}>
          {this.label}
        </a>
      </Host>
    );
  }
}
