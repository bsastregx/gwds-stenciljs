import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'gw-test',
  styleUrl: 'gw-test.scss',
  shadow: true,
})
export class GwTest {
  @Prop() theTitle: string = 'The title';
  @Prop() bgColor: string = 'auto';

  componentDidLoad() {
    setTimeout(() => {
      this.bgColor = '#7ca51b';
    }, 1000);
  }

  render() {
    return (
      <Host>
        <div class="container">
          <div class="row">
            <div class="col">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ipsam, et perferendis numquam maiores fuga asperiores repellendus doloremque laboriosam eos quae consequatur
              quisquam commodi cum incidunt nam quos aliquid maxime eum!
            </div>
            <div class="col">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor impedit quia, doloribus, deserunt iusto illo nemo et rerum magni recusandae, maiores ipsam. Deserunt,
              iure aliquam rerum rem perferendis sequi odit.
            </div>
          </div>
        </div>
        <section class="section" style={{ backgroundColor: this.bgColor }}>
          <h1 class="title">{this.theTitle}</h1>
          <slot></slot>
        </section>
      </Host>
    );
  }
}
