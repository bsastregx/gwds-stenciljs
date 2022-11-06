import { Component, Host, h, Prop, State } from '@stencil/core';
import textContrast from '../../utils/utils';

@Component({
  tag: 'live-2022-card',
  styleUrl: 'live-2022-card.scss',
  shadow: false,
})
export class Live2022Card {
  @Prop() url: string = null;
  @Prop() cardTitle: string = null;
  @Prop() speaker1Name: string = null;
  @Prop() speaker1AvatarUrl: string = null;
  @Prop() speaker2Name: string = null;
  @Prop() speaker2AvatarUrl: string = null;
  @Prop() imageUrl: string = null;
  @Prop() imageAlt: string = null;
  @Prop() bgColor: string = null;
  @Prop() minWidth: string = '250px';
  @Prop() maxWidth: string = '500px';

  @State() textColor: string = null;

  componentWillLoad() {
    //define text color based on contrast with the background
    this.textColor = textContrast(this.bgColor);
  }

  render() {
    return (
      <Host
        style={{
          backgroundColor: `var(--live-2022__color--${this.bgColor})`,
          color: `var(${this.textColor})`,
          minWidth: this.minWidth,
          maxWidth: this.maxWidth,
        }}
        class="live-2022-card"
      >
        <a class="live-2022-card__link" href={this.url}>
          <article>
            {this.cardTitle ? <h4 class="live-2022-card__title h4">{this.cardTitle}</h4> : null}
            {this.speaker1Name ? (
              <div class="live-2022-card__avatar-wrapper">
                {this.speaker1AvatarUrl ? <gwds-avatar imgUrl={this.speaker1AvatarUrl} imgAlt={this.speaker1Name}></gwds-avatar> : null}
                {this.speaker1Name ? <span class="live-2022-card__author">{this.speaker1Name}</span> : null}
              </div>
            ) : null}
            {this.speaker2Name ? (
              <div class="live-2022-card__avatar-wrapper">
                <gwds-avatar imgUrl={this.speaker2AvatarUrl} imgAlt={this.speaker2Name}></gwds-avatar>
                {this.speaker2Name ? <span class="live-2022-card__author">{this.speaker2Name}</span> : null}
              </div>
            ) : null}

            {this.imageUrl ? (
              <div class="live-2022-card__image-wrapper">
                <img src={this.imageUrl} alt={this.imageAlt} />
              </div>
            ) : null}
          </article>
        </a>
      </Host>
    );
  }
}
