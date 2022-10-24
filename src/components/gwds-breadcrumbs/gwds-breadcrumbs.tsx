import { Component, Host, h, Prop, State } from '@stencil/core';

@Component({
  tag: 'gwds-breadcrumbs',
  styleUrl: 'gwds-breadcrumbs.scss',
  shadow: false,
})
export class GwdsBreadcrumbs {
  @Prop() url: string = null;
  @State() breadcrumbs: Array<string> = [];

  componentWillLoad() {
    this.breadcrumbs = this.url.split('/').filter(part => part !== '');
  }

  generateBreadcrumbs() {
    const buffer = [];
    this.breadcrumbs.forEach((part, i) => {
      let item;
      if (i === 0 && (part === 'en' || part === 'es' || part === 'pt')) {
        item = (
          <a href={`https://www.genexus.com/${part}/`}>
            <i class="fa-solid fa-house"></i>
          </a>
        );
      } else {
        item = part;
      }
      buffer.push(item);
      if (i + 1 !== this.breadcrumbs.length) {
        buffer.push(<i class="fa-solid fa-greater-than"></i>);
      }
    });

    return buffer;
  }

  render() {
    return (
      <Host class={{ 'gwds-breadcrumbs': true }}>
        <section class="section">
          <div class="container">{this.generateBreadcrumbs()}</div>
        </section>
      </Host>
    );
  }
}
