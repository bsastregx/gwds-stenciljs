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
  @Prop() buttonLabel: string = null;
  @Prop() buttonUrl: string = null;
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

  slottedContent() {
    return <slot></slot>;
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
        <section>
          <div class={{ 'container': true, 'container--main': true }}>
            <div class={{ 'gwds-blocks__wrapper': true }}>
              {this.mainTitle ? <h2 class="h2">{this.mainTitle}</h2> : null}
              {this.description ? <p class={{ 'gwds-blocks__description': true }}>{this.description}</p> : null}
              {this.linkLabel && this.linkTarget && this.display === 'grid-aside' ? (
                <gwds-button label={this.linkLabel} url={this.linkUrl} blank={this.linkTarget === '_blank'} class="mt-xs mb-0"></gwds-button>
              ) : null}
            </div>
            <gwds-grid perRow={this.perRow()}>{this.slottedContent()}</gwds-grid>
            {this.linkLabel && this.linkTarget && this.display !== 'grid-aside' ? (
              <gwds-button label={this.linkLabel} url={this.linkUrl} blank={this.linkTarget === '_blank'} class="mt-l mb-0"></gwds-button>
            ) : null}
          </div>
        </section>
      </Host>
    );
  }
}
