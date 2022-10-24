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
  @Prop() sliderId: string = null;
  @Prop() cards: boolean = false;
  @Prop() individual: boolean = false;
  @Prop() dark: boolean = false;
  @State() paddingValue = '0';

  componentWillLoad() {
    if (this.padding) {
      this.paddingValue = '96px';
    }
  }

  perPage() {
    if (this.orientation === 'landscape' && !this.individual) {
      return 2;
    } else if (this.orientation === 'portrait' && !this.individual) {
      return 3;
    } else if (this.individual) {
      return 1;
    }
  }

  perPage1399() {
    if (this.orientation === 'landscape' && !this.individual) {
      return 2;
    } else if (this.orientation === 'portrait' && !this.individual) {
      return 3;
    } else if (this.individual) {
      return 1;
    }
  }

  componentDidLoad() {
    new Splide(`#${this.sliderId}`, {
      perPage: this.perPage(),
      lazyLoad: 'nearby',
      gap: this.gap ? `var(--gwds__space--s)` : 0,
      arrows: true,
      padding: { left: this.paddingValue, right: this.paddingValue },
      breakpoints: {
        1399: {
          perPage: this.perPage1399(),
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
          'gwds-slider--dark': this.dark,
        }}
      >
        <section id={this.sliderId} class={{ 'splide': true, 'p-0': true }} aria-labelledby="carousel-heading">
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
