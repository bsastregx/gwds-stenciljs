import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'gw-title',
  styleUrl: 'gw-title.scss',
  shadow: true,
})
export class GwTitle {
  @Prop() type: string = 'h1' || 'h2' || 'h3' || 'h4' || 'h5' || 'h6';
  @Prop() looks: string = this.type;
  @Prop() light: boolean = false;
  @Prop() mt0: boolean = false;

  createTitle() {
    switch (this.type) {
      case 'h1':
        return (
          <h1 class={this.titleClasses()}>
            <slot></slot>
          </h1>
        );
      case 'h2':
        return (
          <h2 class={this.titleClasses()}>
            <slot></slot>
          </h2>
        );
      case 'h3':
        return (
          <h3 class={this.titleClasses()}>
            <slot></slot>
          </h3>
        );
      case 'h4':
        return (
          <h4 class={this.titleClasses()}>
            <slot></slot>
          </h4>
        );
      case 'h5':
        return (
          <h5 class={this.titleClasses()}>
            <slot></slot>
          </h5>
        );
      case 'h6':
        return (
          <h6 class={this.titleClasses()}>
            <slot></slot>
          </h6>
        );
      default:
        return (
          <h1
            class={{
              'title': true,
              'looks-h1': true,
              'light': this.light,
              'mt-0': this.mt0,
            }}
          >
            <slot></slot>
          </h1>
        );
    }
  }

  titleClasses() {
    return {
      'title': true,
      'looks-h1': this.looks === 'h1',
      'looks-h2': this.looks === 'h2',
      'looks-h3': this.looks === 'h3',
      'looks-h4': this.looks === 'h4',
      'looks-h5': this.looks === 'h5',
      'looks-h6': this.looks === 'h6',
      'light': this.light,
      'mt-0': this.mt0,
    };
  }

  render() {
    return <Host>{this.createTitle()}</Host>;
  }
}
