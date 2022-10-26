import { Component, Host, h, Prop, State } from '@stencil/core';
import textContrast from '../../utils/utils';

@Component({
  tag: 'gwds-card',
  styleUrl: 'gwds-card.scss',
  shadow: false,
})
export class GwdsCard {
  @Prop() bgColor: string = 'white';
  @Prop() imgSrc: string = null;
  @Prop() imgAlt: string = null;
  @Prop() tagLabel: string = null;
  @Prop() titleLabel: string = null;
  @Prop() linkUrl: string = null;
  @Prop() linkLabel: string = null;
  @Prop() linkTarget: string = '_self';
  @Prop() noShadow: boolean = false;

  @State() textColor: string = null;

  componentWillLoad() {
    //define text color based on contrast with the background
    this.textColor = textContrast(this.bgColor);
  }

  render() {
    return (
      <Host
        class={{
          'gwds-card': true,
          'gwds__shadow--tiny': !this.noShadow,
        }}
        style={{
          backgroundColor: `var(--gwds__color--${this.bgColor})`,
          color: `var(${this.textColor})`,
        }}
      >
        <article class={{ 'gwds-card__article': true }}>
          {this.imgSrc && this.imgAlt ? (
            <div class={{ 'gwds-card__img-container': true }}>
              <img src={this.imgSrc} alt={this.imgAlt} loading="lazy" />
            </div>
          ) : null}

          {this.imgSrc && !this.imgAlt ? (
            <div class={{ 'gwds-card__img-container': true, 'gwds-card__img-container--no-image': true }}>Please provide an alt attribute for the image</div>
          ) : null}

          <div class={{ 'gwds-card__content-container': true }}>
            {this.tagLabel ? <gwds-tag class={{ 'gwds-card__tag': true }} label={this.tagLabel}></gwds-tag> : null}
            {this.titleLabel ? <h1 class={{ 'gwds-card__title': true, 'h4': true, 'mt-0': true }}>{this.titleLabel}</h1> : null}
            <slot></slot>
            {this.linkUrl && this.linkLabel ? (
              <a class={{ 'gwds-card__link': true }} href={this.linkUrl} target={`"${this.linkTarget}"`}>
                {this.linkLabel}
              </a>
            ) : null}
          </div>
        </article>
      </Host>
    );
  }
}
