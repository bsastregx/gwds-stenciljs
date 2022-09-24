import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'gwds-logo',
  styleUrl: 'gwds-logo.scss',
  shadow: false,
})
export class GwdsLogo {
  @Prop() name: string = null;
  @Prop() imgSrc: string = null;
  @Prop() imgAlt: string = null;
  @Prop() label: string = null;
  @Prop() size: string = '32px';
  @Prop() linkUrl: string = null;

  render() {
    return (
      <Host class={{ 'gwds-logo': true }}>
        <article class={{ 'gwds-logo__container': true }}>
          {this.linkUrl ? <a class={{ 'gwds-logo__anchor': true }} href={this.linkUrl} target="_blank"></a> : null}
          <img
            style={{
              width: this.size,
            }}
            class={{ 'gwds-logo__image': true }}
            src={this.imgSrc}
            alt={this.imgAlt}
            loading="lazy"
          />
          {this.label ? <h1 class={{ 'gwds-logo__label h5': true }}>{this.label}</h1> : null}
        </article>
      </Host>
    );
  }
}
