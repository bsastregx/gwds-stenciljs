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
  //First Button
  @Prop() firstButtonLabel: string = null;
  @Prop() firstButtonUrl: string = null;
  @Prop() firstButtonType: 'primary' | 'secondary' | 'tertiary' = 'primary';
  @Prop() firstButtonTarget: '_blank' | '_self' = '_self';
  //Second Button
  @Prop() secondButtonLabel: string = null;
  @Prop() secondButtonUrl: string = null;
  @Prop() secondButtonType: 'primary' | 'secondary' | 'tertiary' = 'primary';
  @Prop() secondButtonTarget: '_blank' | '_self' = '_self';
  //Third Button
  @Prop() thirdButtonLabel: string = null;
  @Prop() thirdButtonUrl: string = null;
  @Prop() thirdButtonType: 'primary' | 'secondary' | 'tertiary' = 'primary';
  @Prop() thirdButtonTarget: '_blank' | '_self' = '_self';

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
              {this.firstButtonLabel && this.firstButtonUrl ? (
                <gwds-button label={this.firstButtonLabel} type={this.firstButtonType} url={this.firstButtonUrl} target={this.firstButtonTarget}></gwds-button>
              ) : null}
              {this.secondButtonLabel && this.secondButtonUrl ? (
                <gwds-button label={this.secondButtonLabel} type={this.secondButtonType} url={this.secondButtonUrl} target={this.secondButtonTarget}></gwds-button>
              ) : null}
              {this.thirdButtonLabel && this.thirdButtonUrl ? (
                <gwds-button label={this.thirdButtonLabel} type={this.thirdButtonType} url={this.thirdButtonUrl} target={this.thirdButtonTarget}></gwds-button>
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
