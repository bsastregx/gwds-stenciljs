import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'gwds-good-news',
  styleUrl: 'gwds-good-news.scss',
  shadow: false,
})
export class GwdsGoodNews {
  @Prop() category: string = null;
  @Prop() newsTitle: string = null;
  @Prop() authorName: string = null;
  @Prop() authorAvatarUrl: string = null;
  @Prop() authorAvatarAlt: string = null;
  @Prop() imgUrl: string = null;
  @Prop() imgAlt: string = null;
  @Prop() date: string = null;
  @Prop() url: string = null;
  @Prop() layout: 'l1' | 'l2' = 'l1';

  render() {
    return (
      <Host
        class={{
          'gwds-good-news': true,
          'gwds-good-news--l1': this.layout === 'l1',
          'gwds-good-news--l2': this.layout === 'l2',
        }}
      >
        <article class="gwds-good-news__article">
          {this.layout === 'l2' ? (
            <div class="gwds-good-news__img-wrapper">
              <a href={this.url} class="gwds-good-news__img-link">
                <img src={this.imgUrl} class="gwds-good-news__img"></img>
              </a>
            </div>
          ) : null}
          <gwds-tag label={this.category} bg-color="black"></gwds-tag>
          <h1 class="h5 gwds-good-news__title">
            <a href={this.url} class="gwds-good-news__link">
              {this.newsTitle}
            </a>
          </h1>
          <div class="gwds-good-news__wrapper">
            <gwds-avatar imgUrl={this.authorAvatarUrl} imgAlt={this.authorAvatarAlt}></gwds-avatar>
            <span class="gwds-good-news__autor-name">{this.authorName}</span>
            <span class="pipe">|</span>
            <time class="gwds-good-news__date" dateTime={this.date}>
              {this.date}
            </time>
          </div>
          <slot></slot>
        </article>
      </Host>
    );
  }
}
