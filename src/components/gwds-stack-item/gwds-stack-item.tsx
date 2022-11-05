import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'gwds-stack-item',
  styleUrl: 'gwds-stack-item.scss',
  shadow: false,
})
export class GwdsStackItem {
  @Prop() iconUrl: string = null;
  @Prop() iconAlt: string = null;
  @Prop() mainTitle: string = null;
  @Prop() buttonLabel: string = null;
  @Prop() buttonUrl: string = null;
  @Prop() buttonBlank: boolean = false;
  @Prop() visible: boolean = false;

  render() {
    return (
      <Host
        class={{
          'gwds-stack-item': true,
          'gwds-stack-item--visible': this.visible,
        }}
      >
        <h2
          class={{
            'h3': true,
            'gwds-stack-item__title': true,
            'mt-0': true,
          }}
        >
          {this.iconUrl ? <img src={this.iconUrl} alt={this.iconAlt} class="gwds-stack-item__icon"></img> : null}
          {this.mainTitle}
        </h2>
        <slot></slot>
        <div>
          {this.buttonLabel && this.buttonUrl ? <gwds-button class="gwds-stack-item__button" type="secondary" url={this.buttonUrl} label={this.buttonLabel}></gwds-button> : null}
        </div>
      </Host>
    );
  }
}
