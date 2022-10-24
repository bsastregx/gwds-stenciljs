import { Component, Host, h, Prop, State } from '@stencil/core';
import textContrast from '../../utils/utils';

@Component({
  tag: 'gwds-blocks',
  styleUrl: 'gwds-blocks.scss',
  shadow: false,
})
export class GwdsBlocks {
  @Prop() bgColor: string = 'dark-100';
  @Prop() mainTitle: string = null;
  @Prop() description: string = null;
  //Button Primary
  @Prop() buttonPrimaryLabel: string = null;
  @Prop() buttonPrimaryUrl: string = null;
  @Prop() buttonPrimaryBlank: boolean = false;
  //Button Secondary
  @Prop() buttonSecondaryLabel: string = null;
  @Prop() buttonSecondaryUrl: string = null;
  @Prop() buttonSecondaryBlank: boolean = false;
  //Button Tertiary
  @Prop() buttonTertiaryLabel: string = null;
  @Prop() buttonTertiaryUrl: string = null;
  @Prop() buttonTertiaryBlank: boolean = false;

  @Prop() linkUrl: string = null;
  @Prop() linkLabel: string = null;
  @Prop() linkTarget: '_blank' | '_self' = '_self';
  @Prop() display: 'grid-2' | 'grid-3' | 'grid-aside' = 'grid-2';

  @State() textColor: string = null;

  componentWillLoad() {
    //define text color based on contrast with the background
    this.textColor = textContrast(this.bgColor);
  }

  perRow() {
    if (this.display === 'grid-2' || this.display === 'grid-aside') {
      return '2';
    }
    if (this.display === 'grid-3') {
      return '3';
    }
  }

  render() {
    return (
      <Host
        class={{
          'gwds-blocks': true,
          'gwds-blocks--grid-2': this.display === 'grid-2',
          'gwds-blocks--grid-3': this.display === 'grid-3',
          'gwds-blocks--grid-aside': this.display === 'grid-aside',
        }}
        style={{
          backgroundColor: `var(--gwds__color--${this.bgColor})`,
          color: `var(${this.textColor})`,
        }}
      >
        <section class="section">
          <div class={{ 'container': true, 'container--main': true }}>
            <div class={{ 'gwds-blocks__wrapper': true }}>
              {this.mainTitle ? <h2 class="h2">{this.mainTitle}</h2> : null}
              {this.description ? <p class={{ 'gwds-blocks__description': true }}>{this.description}</p> : null}
              {this.buttonPrimaryLabel && this.buttonPrimaryUrl ? (
                <gwds-button label={this.buttonPrimaryLabel} type="primary" url={this.buttonPrimaryUrl} blank={this.buttonPrimaryBlank ? true : false}></gwds-button>
              ) : null}
              {this.buttonSecondaryLabel && this.buttonSecondaryUrl ? (
                <gwds-button label={this.buttonSecondaryLabel} type="secondary" url={this.buttonSecondaryUrl} blank={this.buttonSecondaryBlank ? true : false}></gwds-button>
              ) : null}
              {this.buttonTertiaryLabel && this.buttonTertiaryUrl ? (
                <gwds-button label={this.buttonTertiaryLabel} type="tertiary" url={this.buttonTertiaryUrl} blank={this.buttonTertiaryBlank ? true : false}></gwds-button>
              ) : null}
            </div>
            <gwds-grid perRow={this.perRow()}>
              <slot></slot>
            </gwds-grid>
          </div>
        </section>
      </Host>
    );
  }
}
