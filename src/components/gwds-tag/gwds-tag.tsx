import { Component, Host, h, Prop, State } from '@stencil/core';
import textContrast from '../../utils/utils';

@Component({
  tag: 'gwds-tag',
  styleUrl: 'gwds-tag.scss',
  shadow: false,
})
export class GwdsTag {
  @Prop() label: string = null;
  @Prop() bgColor: string = 'violet-50';
  @Prop() url: string = null;

  @State() textColor: string = null;

  componentWillLoad() {
    //define text color based on contrast with the background
    this.textColor = textContrast(this.bgColor);
  }

  render() {
    return (
      <Host class={{ 'gwds-tag': true }}>
        <small class={{ 'gwds-tag__span': true }} style={{ backgroundColor: `var(--gwds__color--${this.bgColor})`, color: `var(${this.textColor})` }}>
          {this.label}
        </small>
      </Host>
    );
  }
}
