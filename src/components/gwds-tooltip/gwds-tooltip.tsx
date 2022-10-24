import { Component, Host, h, Prop, State } from '@stencil/core';

@Component({
  tag: 'gwds-tooltip',
  styleUrl: 'gwds-tooltip.scss',
  shadow: false,
})
export class GwdsTooltip {
  @Prop() width: string = '200px';
  @Prop() label: string = null;
  @Prop() position: 'top' | 'right' | 'bottom' | 'left' = 'top';
  @State() display: boolean = false;
  @State() pointerEventsAuto: boolean = false;

  mouseEnterSlotChildren() {
    this.pointerEventsAuto = true;
  }

  mouseLeaveHost() {
    this.pointerEventsAuto = false;
  }

  render() {
    return (
      <Host
        class={{
          'gwds-tooltip': true,
          'gwds-tooltip--display': this.display,
          'gwds-tooltip--top': this.position === 'top',
          'gwds-tooltip--right': this.position === 'right',
          'gwds-tooltip--bottom': this.position === 'bottom',
          'gwds-tooltip--left': this.position === 'left',
          'gwds-tooltip--pointer-events-auto': this.pointerEventsAuto,
        }}
        onMouseLeave={this.mouseLeaveHost.bind(this)}
      >
        <div class="gwds-tooltip__slot--children" onMouseEnter={this.mouseEnterSlotChildren.bind(this)}>
          <slot name="children"></slot>
        </div>
        <div class="gwds-tooltip__slot--content" style={{ width: this.width }}>
          {this.label}
          <slot name="content"></slot>
        </div>
      </Host>
    );
  }
}
