import { Component, Host, h, Prop, State } from '@stencil/core';
import Splide from '@splidejs/splide';

@Component({
  tag: 'gwds-slider',
  styleUrl: 'gwds-slider.scss',
  shadow: false,
})
export class GwdsSlider {
  @Prop() cover: boolean = false;
  @Prop() gap: boolean = false;
  @Prop() padding: boolean = false;
  @Prop() orientation: 'landscape' | 'portrait' = 'landscape';
  @Prop() slideId: string = null;
  @Prop() cards: boolean = false;
  @State() paddingValue = '0';

  componentWillLoad() {
    if (this.padding) {
      this.paddingValue = '96px';
    }
  }

  componentDidLoad() {
    new Splide(`#${this.slideId}`, {
      perPage: this.orientation === 'landscape' ? 3 : 4,
      lazyLoad: 'nearby',
      gap: this.gap ? `var(--gwds__space--s)` : 0,
      arrows: true,
      padding: { left: this.paddingValue, right: this.paddingValue },
      breakpoints: {
        1399: {
          perPage: this.orientation === 'landscape' ? 2 : 3,
        },
        992: {
          perPage: this.orientation === 'landscape' ? 1 : 2,
        },
        767: {
          perPage: this.orientation === 'landscape' ? 1 : 1,
        },
        575: {
          perPage: this.orientation === 'landscape' ? 1 : 1,
        },
      },
    }).mount();
  }

  render() {
    return (
      <Host
        class={{
          'gwds-slider': true,
          'gwds-slider--cover': this.cover,
          'gwds-slider--gap': this.gap,
          'gwds-slider--cards': this.cards,
        }}
      >
        <section id={this.slideId} class={{ 'splide': true, 'p-0': true }} aria-labelledby="carousel-heading">
          <div class="splide__track">
            <ul class="splide__list unstyled">
              <slot></slot>
            </ul>
          </div>
        </section>
      </Host>
    );
  }
}
