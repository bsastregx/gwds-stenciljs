import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'gwds-progress-bar',
  styleUrl: 'gwds-progress-bar.scss',
  shadow: true,
})
export class GwdsProgressBar {
  render() {
    return (
      <Host class={{ 'gwds-progress-bar': true }}>
        <span class={{ 'gwds-progress-bar__indicator': true }}></span>
      </Host>
    );
  }
}
