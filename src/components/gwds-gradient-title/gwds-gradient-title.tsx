import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'gwds-gradient-title',
  styleUrl: 'gwds-gradient-title.scss',
  shadow: false,
})
export class GwdsGradientTitle {
  @Prop() from: string = 'red-200';
  @Prop() to: string = 'red-400';
  @Prop() center: boolean = false;

  render() {
    return (
      <Host class={{ 'gwds-gradient-title': true, 'h1': true }}>
        <div class={{ container: true, tac: this.center }}>
          <h2
            class={{ h1: true, title: true, tac: this.center }}
            style={{ background: `-webkit-linear-gradient(45deg, var(--gwds__color--${this.from}), var(--gwds__color--${this.to}))` }}
          >
            <slot></slot>
          </h2>
        </div>
      </Host>
    );
  }
}

//backgroundColor: `var(--gwds__color--${this.bgColor})`,
