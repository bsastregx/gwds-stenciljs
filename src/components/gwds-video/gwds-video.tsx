import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'gwds-video',
  styleUrl: 'gwds-video.scss',
  shadow: false,
})
export class GwdsVideo {
  @Prop() url: string = null;
  @Prop() source: 'youtube' | 'vimeo' = 'youtube';
  @Prop() fullWidth: boolean = false;

  componentWillLoad() {}

  componentDidLoad() {}

  render() {
    return (
      <Host class={{ 'gwds-video': true, 'gwds-video--full-width': this.fullWidth }}>
        <div class={{ 'gwds-video__container': this.fullWidth }}>
          <iframe
            loading="lazy"
            width="560"
            height="315"
            src={`${this.url}?rel=0&showinfo=0`}
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullScreen
          ></iframe>
          <slot></slot>
        </div>
      </Host>
    );
  }
}
