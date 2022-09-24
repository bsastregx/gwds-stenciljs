import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'gwds-component-title',
  styleUrl: 'gwds-component-title.scss',
  shadow: false,
})
export class GwdsComponentTitle {
  @Prop() experimental: boolean = false;

  render() {
    return (
      <Host class={{ 'gwds-component-title': true }}>
        <span class={{ 'gwds-component-title__label': true }}>
          <slot></slot> ↓ {this.experimental ? <span class={{ 'gwds-component-title__experimental': true }}>experimental</span> : null}
        </span>
      </Host>
    );
  }
}
