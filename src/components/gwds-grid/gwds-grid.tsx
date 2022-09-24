import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'gwds-grid',
  styleUrl: 'gwds-grid.scss',
  shadow: false,
})
export class GwdsGrid {
  @Prop() perRow: '2' | '3' | '4' | '6' = '3';

  render() {
    return (
      <Host class={{ 'gwds-grid': true }}>
        <div
          class={{
            'gwds-grid__container': true,
            'gwds-grid__container--2': this.perRow === '2',
            'gwds-grid__container--3': this.perRow === '3',
            'gwds-grid__container--4': this.perRow === '4',
            'gwds-grid__container--6': this.perRow === '6',
          }}
        >
          <slot></slot>
        </div>
      </Host>
    );
  }
}
