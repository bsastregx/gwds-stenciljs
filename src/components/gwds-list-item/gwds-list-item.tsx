import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'gwds-list-item',
  styleUrl: 'gwds-list-item.scss',
  shadow: false,
})
export class GwdsListItem {
  @Prop() iconUrl: string = null;
  @Prop() iconAlt: string = null;

  render() {
    return (
      <Host
        class={{
          'gwds-list-item': true,
        }}
      >
        {this.iconUrl ? <img class="gwds-list-item__icon" src={this.iconUrl} alt={this.iconAlt} width="60" height="60" /> : null}
        <slot></slot>
      </Host>
    );
  }
}
