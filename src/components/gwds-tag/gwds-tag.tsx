import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'gwds-tag',
  styleUrl: 'gwds-tag.scss',
  shadow: false,
})
export class GwdsTag {
  @Prop() label: string = null;
  @Prop() bgColor: 'violet-50' = 'violet-50';
  render() {
    return (
      <Host class={{ 'gwds-tag': true }}>
        <small class={{ 'gwds-tag__span': true }} style={{ backgroundColor: `var(--gwds__color--${this.bgColor})` }}>
          {this.label}
        </small>
      </Host>
    );
  }
}
