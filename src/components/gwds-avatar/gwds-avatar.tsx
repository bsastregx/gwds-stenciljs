import { Component, Host, h, Prop, getAssetPath } from '@stencil/core';

@Component({
  tag: 'gwds-avatar',
  styleUrl: 'gwds-avatar.scss',
  shadow: false,
  assetsDirs: ['assets'],
})
export class GwdsAvatar {
  @Prop() imgUrl: string = getAssetPath(`./assets/images/avatar-placeholder.svg`);
  @Prop() imgAlt: string = null;
  @Prop() size: 'm' | 'l' | 'xl' | 'xxl' = 'm';
  @Prop() line: boolean = false;

  render() {
    return (
      <Host
        class={{
          'gwds-avatar': true,
          'gwds-avatar--line': this.line,
          'gwds-avatar--m': this.size === 'm',
          'gwds-avatar--l': this.size === 'l',
          'gwds-avatar--xl': this.size === 'xl',
          'gwds-avatar--xxl': this.size === 'xxl',
        }}
      >
        <div class="gwds-avatar__image-wrapper">
          <img class="gwds-avatar__image" src={this.imgUrl} alt={this.imgAlt} />
        </div>
        <slot></slot>
      </Host>
    );
  }
}
