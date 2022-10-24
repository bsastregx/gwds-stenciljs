import { Component, Host, h, Prop, State } from '@stencil/core';

@Component({
  tag: 'gwds-component-title',
  styleUrl: 'gwds-component-title.scss',
  shadow: false,
})
export class GwdsComponentTitle {
  @Prop() label: string = null;
  @Prop() experimental: boolean = false;
  @State() showCode: boolean = false;

  toggleCode() {
    if (this.showCode) {
      this.showCode = false;
    } else {
      this.showCode = true;
    }
  }

  render() {
    return (
      <Host class={{ 'gwds-component-title': true }}>
        <h>
          <div class="gwds-component-title__wrapper">
            <span class={{ 'gwds-component-title__label': true }}>
              {this.label} ↓{' '}
              {this.experimental ? (
                <span class={{ 'gwds-component-title__experimental': true }}>
                  <i class="fa-solid fa-flask" style={{ marginRight: '6px' }}></i>
                  experimental
                </span>
              ) : null}
            </span>
            <span class="gwds-component-title__show-properties" onClick={this.toggleCode.bind(this)}>
              <i class="fa-solid fa-wrench"></i> {this.showCode ? 'hide properties' : 'show properties'}
            </span>
          </div>
          <code class={{ 'gwds-component-title__code': true, 'gwds-component-title__code--show': this.showCode }}>
            <slot></slot>
          </code>
        </h>
      </Host>
    );
  }
}
