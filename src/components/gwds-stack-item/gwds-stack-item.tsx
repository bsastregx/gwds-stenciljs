import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'gwds-stack-item',
  styleUrl: 'gwds-stack-item.scss',
  shadow: true,
})
export class GwdsStackItem {
  @Prop() mainTitle: string = null;
  @Prop() buttonLabel: string = null;
  @Prop() buttonUrl: string = null;
  @Prop() buttonBlank: boolean = false;

  render() {
    return (
      <Host
        class={{
          'gwds-stack-item': true,
        }}
      >
        <h2
          class={{
            'gwds-stack-item__title': true,
          }}
        >
          {this.mainTitle}
        </h2>
        <slot></slot>
        {}
      </Host>
    );
  }
}
