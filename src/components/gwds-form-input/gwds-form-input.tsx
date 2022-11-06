import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'gwds-form-input',
  styleUrl: 'gwds-form-input.scss',
  shadow: false,
})
export class GwdsFormInput {
  @Prop() placeholder: string = null;
  @Prop() minWidth: string = '250px';
  @Prop() maxWidth: string = '100%';

  render() {
    return (
      <Host class="gwds-form-input">
        <input type="text" placeholder={this.placeholder} style={{ minWidth: this.minWidth, maxWidth: this.maxWidth }}></input>
      </Host>
    );
  }
}
