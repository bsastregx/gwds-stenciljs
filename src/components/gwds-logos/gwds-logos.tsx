import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'gwds-logos',
  styleUrl: 'gwds-logos.scss',
  shadow: false,
})
export class GwdsLogos {
  @Prop() mainTitle: string = null;

  render() {
    return (
      <Host class={{ 'gwds-logos': true }}>
        <div class="container">
          {this.mainTitle ? <h3 class="h5">{this.mainTitle}</h3> : null}
          <gwds-grid perRow="6">
            <slot></slot>
          </gwds-grid>
        </div>
      </Host>
    );
  }
}
