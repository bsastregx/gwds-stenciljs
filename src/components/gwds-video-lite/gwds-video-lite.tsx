import { Component, Host, h, Prop, State, Element } from '@stencil/core';

@Component({
  tag: 'gwds-video-lite',
  styleUrl: 'gwds-video-lite.scss',
  shadow: false,
})
export class GwdsVideoLite {
  @Element() el: HTMLElement;

  @Prop() videoId: string = null;
  @Prop() maxWidth: string = '100%';
  @Prop() poster: string = null;
  @Prop() playLabel: string = 'Play';
  @Prop() params: string = '';

  @State() activated: boolean = false;
  @State() preconnected: boolean = false;
  @State() needsYTApiForAutoplay: boolean = false;
  @State() ytApiPromise: Promise<any>;

  componentWillLoad() {
    // On hover (or tap), warm up the TCP connections we're (likely) about to use.
    this.el.addEventListener('pointerover', this.warmConnections.bind(this), {
      once: true,
    });

    // Once the user clicks, add the real iframe and drop our play button
    // TODO: In the future we could be like amp-youtube and silently swap in the iframe during idle time
    //   We'd want to only do this for in-viewport or near-viewport ones: https://github.com/ampproject/amphtml/pull/5003
    this.el.addEventListener('click', this.addIframe.bind(this));

    // Chrome & Edge desktop have no problem with the basic YouTube Embed with ?autoplay=1
    // However Safari desktop and most/all mobile browsers do not successfully track the user gesture of clicking through the creation/loading of the iframe,
    // so they don't autoplay automatically. Instead we must load an additional 2 sequential JS files (1KB + 165KB) (un-br) for the YT Player API
    // TODO: Try loading the the YT API in parallel with our iframe and then attaching/playing it. #82
    this.needsYTApiForAutoplay = navigator.vendor.includes('Apple') || navigator.userAgent.includes('Mobi');
  }

  /**
   * Add a <link rel={preload | preconnect} ...> to the head
   */
  addPrefetch(kind, url, as = undefined) {
    const linkEl = document.createElement('link');
    linkEl.rel = kind;
    linkEl.as;
    linkEl.href = url;
    if (as) {
      linkEl.as = as;
    }
    document.head.append(linkEl);
  }

  /**
   * Begin pre-connecting to warm up the iframe load
   * Since the embed's network requests load within its iframe,
   *   preload/prefetch'ing them outside the iframe will only cause double-downloads.
   * So, the best we can do is warm up a few connections to origins that are in the critical path.
   *
   * Maybe `<link rel=preload as=document>` would work, but it's unsupported: http://crbug.com/593267
   * But TBH, I don't think it'll happen soon with Site Isolation and split caches adding serious complexity.
   */
  warmConnections() {
    if (this.preconnected) return;

    // The iframe document and most of its subresources come right off youtube.com
    this.addPrefetch('preconnect', 'https://www.youtube-nocookie.com');
    // The botguard script is fetched off from google.com
    this.addPrefetch('preconnect', 'https://www.google.com');

    // Not certain if these ad related domains are in the critical path. Could verify with domain-specific throttling.
    this.addPrefetch('preconnect', 'https://googleads.g.doubleclick.net');
    this.addPrefetch('preconnect', 'https://static.doubleclick.net');

    this.preconnected = true;
  }

  fetchYTPlayerApi() {
    if (window['YT'] || (window['YT'] && window['YT'].Player)) return;

    this.ytApiPromise = new Promise((res, rej) => {
      var el = document.createElement('script');
      el.src = 'https://www.youtube.com/iframe_api';
      el.async = true;
      el.onload = _ => {
        window['YT'].ready(res);
      };
      el.onerror = rej;
      this.el.append(el);
      console.log('this', this);
    });
  }

  async addYTPlayerIframe(params) {
    this.fetchYTPlayerApi();
    await this.ytApiPromise;

    const videoPlaceholderEl = document.createElement('div');
    this.el.append(videoPlaceholderEl);

    const paramsObj = Object.fromEntries(params.entries());

    new window['YT'].Player(videoPlaceholderEl, {
      width: '100%',
      videoId: this.videoId,
      playerVars: paramsObj,
      events: {
        onReady: event => {
          event.target.playVideo();
        },
      },
    });
  }

  async addIframe() {
    if (this.activated) return;
    this.activated = true;

    const params = new URLSearchParams(this.params || []);
    params.append('autoplay', '1');
    params.append('playsinline', '1');
    params.append('rel', '0');
    params.append('showinfo', '0');
    params.append('modestbranding', '1');

    if (this.needsYTApiForAutoplay) {
      return this.addYTPlayerIframe(params);
    }

    const iframeEl = document.createElement('iframe');
    iframeEl.width = '560';
    iframeEl.height = '315';
    // No encoding necessary as [title] is safe. https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#:~:text=Safe%20HTML%20Attributes%20include
    iframeEl.title = this.playLabel;
    iframeEl.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
    iframeEl.allowFullscreen = true;
    // AFAIK, the encoding here isn't necessary for XSS, but we'll do it only because this is a URL
    // https://stackoverflow.com/q/64959723/89484
    iframeEl.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(this.videoId)}?${params.toString()}`;
    this.el.append(iframeEl);

    // Set focus for a11y
    iframeEl.focus();
  }

  render() {
    return (
      <Host class={{ 'gwds-video-lite': true, 'gwds-video-lite--activated': this.activated }} style={{ maxWidth: this.maxWidth, backgroundImage: `url(${this.poster})` }}>
        <button type="button" class="gwds-video-lite__button">
          <span class="gwds-video-lite__play-label">{this.playLabel}</span>
        </button>
        {/* <lite-youtube></lite-youtube> */}
      </Host>
    );
  }
}
