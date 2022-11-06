import { Component, Host, h, Element } from '@stencil/core';

@Component({
  tag: 'live-2022-search-box',
  styleUrl: 'live-2022-search-box.scss',
  shadow: false,
})
export class Live2022SearchBox {
  @Element() el: HTMLElement;
  private transitionSpeed: number = 200;

  handleInput(e) {
    const value = e.target.value;
    this.filter(value);
  }

  filter(value) {
    const categories = this.el.querySelectorAll('.live-2022-category');
    categories.forEach(this.filterCategory.bind(this, value));
  }

  filterCategory(value, cat) {
    value = value.toLocaleLowerCase().trim();
    let categoryIsEmpty = true;
    const deepDives = (cat as HTMLElement).querySelectorAll('live-2022-card');
    deepDives.forEach(deepDive => {
      (deepDive as HTMLElement).style.transition = '.2s opacity';
      (deepDive as HTMLElement).style.opacity = '1';

      const title = deepDive.getAttribute('card-title');
      const speaker1 = deepDive.getAttribute('speaker-1-name');
      const speaker2 = deepDive.getAttribute('speaker-2-name');

      const titleMatch = title.toLocaleLowerCase().includes(value);
      let speaker1Match = false;
      if (speaker1) {
        speaker1Match = speaker1.toLocaleLowerCase().includes(value);
      }
      let speaker2Match = false;
      if (speaker2) {
        speaker1Match = speaker2.toLocaleLowerCase().includes(value);
      }

      if (titleMatch || speaker1Match || speaker2Match) {
        categoryIsEmpty = false;
        deepDive.classList.remove('d-none');
        setTimeout(() => {
          deepDive.classList.remove('opacity-0');
        }, 1);
      } else {
        deepDive.classList.add('opacity-0');
        setTimeout(() => {
          deepDive.classList.add('d-none');
        }, this.transitionSpeed);
      }
    });

    //If no deep dives are visible inside a category, also hide the title.
    const categoryTitle = (cat as HTMLElement).querySelector('.live-2022-category__title');
    if (categoryIsEmpty) {
      if (categoryTitle) {
        (categoryTitle as HTMLElement).style.transition = '.2s opacity';
        (categoryTitle as HTMLElement).style.opacity = '1';
        categoryTitle.classList.add('opacity-0');
        setTimeout(() => {
          categoryTitle.classList.add('d-none');
        }, this.transitionSpeed);
      }
    } else {
      if (categoryTitle) {
        categoryTitle.classList.remove('d-none');
        categoryTitle.classList.remove('opacity-0');
      }
    }
  }

  render() {
    return (
      <Host class="live-2022-search-box">
        <section class="section">
          <div class="container">
            <gwds-form-input onInput={this.handleInput.bind(this)} class="live-2022-search-box__input" placeholder="Search for deep dives or authors"></gwds-form-input>
            <slot></slot>
          </div>
        </section>
      </Host>
    );
  }
}
