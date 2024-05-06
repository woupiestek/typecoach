import { css, html, LitElement } from "lit";

export class TypeCoach extends LitElement {
  static styles = [
    css`
      div:focus {
        background: pink;
      }
    `,
  ];

  render() {
    return html`<div tabindex="0" @keydown="${(e) =>
      console.info(e.key)}">Hello, World!</div>`;
  }
}

customElements.define("type-coach", TypeCoach);
