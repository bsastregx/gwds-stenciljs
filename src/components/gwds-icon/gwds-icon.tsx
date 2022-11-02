import { Component, Element, h, State, Watch, Prop } from '@stencil/core';
import { getSvgContent, iconContent } from './requests';

@Component({
  tag: 'gwds-icon',
  styleUrl: 'gwds-icon.scss',
  shadow: false,
  assetsDirs: ['icon-assets'],
})
export class GwdsIcon {
  private io?: IntersectionObserver;

  @Element() element: HTMLElement;

  /**
   * The color of the icon.
   */
  @Prop() color: Color;

  /**
   * If enabled, the icon will be loaded lazily when it's visible in the viewport.
   */
  @Prop() lazy = false;

  /**
   * The size of the icon. Possible values: small, medium, large.
   */
  @Prop() size: Size = 'small';

  /**
   * The URL of the icon.
   */
  @Prop({ reflect: true }) src = '';

  @State() private isVisible = false;
  @State() private svgContent?: string;

  connectedCallback() {
    // purposely do not return the promise here because loading
    // the svg file should not hold up loading the app
    // only load the svg if it's visible
    this.waitUntilVisible(this.element, '50px', () => {
      this.isVisible = true;
      this.getIcon();
    });
  }

  disconnectedCallback() {
    if (this.io !== undefined) {
      this.io.disconnect();
      this.io = undefined;
    }
  }

  private waitUntilVisible(el: HTMLElement, rootMargin: string, callback: () => void) {
    if (this.lazy && typeof window !== 'undefined' && (window as any).IntersectionObserver) {
      const io = (this.io = new (window as any).IntersectionObserver(
        (data: IntersectionObserverEntry[]) => {
          if (data[0].isIntersecting) {
            io.disconnect();
            this.io = undefined;
            callback();
          }
        },
        { rootMargin },
      ));

      io.observe(el);
    } else {
      // browser doesn't support IntersectionObserver
      // so just fallback to always show it
      callback();
    }
  }

  @Watch('src')
  private async getIcon() {
    if (this.isVisible) {
      if (this.src) {
        if (iconContent.has(this.src)) {
          this.svgContent = iconContent.get(this.src);
        } else {
          this.svgContent = await getSvgContent(this.src);
        }
      } else {
        this.svgContent = '';
        return;
      }
    }
  }

  render() {
    return <div innerHTML={this.svgContent} />;
  }
}

export type Color =
  | 'primary-enabled'
  | 'primary-active'
  | 'primary-hover'
  | 'onbackground'
  | 'negative'
  | 'disabled'
  | 'ondisabled'
  | 'error'
  | 'success'
  | 'warning'
  | 'alwaysblack'
  | 'auto';

export type Size = 'small' | 'medium' | 'large';
