import { Component, Host, h, Prop, getAssetPath } from '@stencil/core';

@Component({
  tag: 'gwds-language-switcher',
  styleUrl: 'gwds-language-switcher.scss',
  shadow: false,
})
export class GwdsLanguageSwitcher {
  @Prop() enUrl: string = null;
  @Prop() esUrl: string = null;
  @Prop() ptUrl: string = null;
  @Prop() selectedLang: 'en' | 'es' | 'pt' = null;

  renderSelectedLang() {
    if (this.selectedLang) {
      if (this.selectedLang === 'en') {
        return 'English';
      } else if (this.selectedLang === 'es') {
        return 'Español';
      } else if (this.selectedLang === 'pt') {
        return 'Português';
      }
    } else {
      return 'No language selected';
    }
  }

  componentWillLoad() {}

  render() {
    return (
      <Host class={{ 'gwds-language-switcher': true }}>
        <span class="gwds-language-switcher__selected-lang">
          <img class="gwds-icon" src={getAssetPath('../assets/icons/globe.svg')}></img> {this.renderSelectedLang()}
          <ul class="gwds-language-switcher__list unstyled gwds__shadow--tiny">
            {this.selectedLang !== 'en' ? (
              <li class="gwds-language-switcher__list-item">
                <a class="gwds-language-switcher__list-link" href={this.enUrl}>
                  English
                </a>
              </li>
            ) : null}
            {this.selectedLang !== 'es' ? (
              <li class="gwds-language-switcher__list-item">
                <a class="gwds-language-switcher__list-link" href={this.esUrl}>
                  Español
                </a>
              </li>
            ) : null}
            {this.selectedLang !== 'pt' ? (
              <li class="gwds-language-switcher__list-item">
                <a class="gwds-language-switcher__list-link" href={this.ptUrl}>
                  Português
                </a>
              </li>
            ) : null}
          </ul>
        </span>
      </Host>
    );
  }
}
