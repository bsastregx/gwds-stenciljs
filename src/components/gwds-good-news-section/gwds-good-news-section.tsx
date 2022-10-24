import { Component, Host, h, Prop, Watch } from '@stencil/core';

@Component({
  tag: 'gwds-good-news-section',
  styleUrl: 'gwds-good-news-section.scss',
  shadow: false,
})
export class GwdsGoodNewsSection {
  @Prop() sectionTitle: string = null;
  @Prop() data: Array<Object> | undefined = undefined;
  @Prop() test: string = null;
  @Prop() layout: 'l1' | 'l2' = 'l1';

  @Watch('data')
  watchPropHandler(newValue) {
    if (newValue !== undefined) {
    }
  }

  renderNews() {
    if (this.data !== null && this.data !== undefined) {
      const buffer = [];
      this.data['news'].forEach(news => {
        buffer.push(
          <gwds-good-news
            category={news['category']}
            news-title={news['title']}
            author-avatar-url={news['author-avatar-url']}
            author-name={news['autor-name']}
            date={news['date']}
            imgUrl={news['image-url']}
            layout={this.layout}
          ></gwds-good-news>,
        );
      });
      return buffer;
    }
  }

  render() {
    return (
      <Host class={{ 'gwds-good-news-section': true }}>
        <section class="section">
          <div class="container">
            <h1 class="h4 mt-0">{this.sectionTitle}</h1>
            <div class="gwds-good-news-section__slotted-content">
              <slot></slot>
            </div>
            <div class="gwds-good-news-section__wrapper">
              <gwds-grid per-row="4">{this.renderNews()}</gwds-grid>
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
