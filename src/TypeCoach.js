import { css, html, LitElement } from "lit";
import { Heap } from "./Heap";

const testSet =
  "qwertyuiop[]QWERTYUIOP{}asdfghjkl;'ASDFGHJKL:\"zxcvbnm,./ZXCVBNM<>?";

export class TypeCoach extends LitElement {
  static properties = {
    code: { type: Number },
    median: { type: Number },
  };

  static styles = [
    css`
      .font {
        font-size: 48px;
        font-weight: bold;
        font-family: serif;
      }
      .main {
        cursor: pointer;
      }

      .main:focus {
        background: #ffddff;
      }
    `,
  ];

  constructor() {
    super();
    this.delta = 0;
    this.__codes = new Heap();
    for (let i = 0, l = testSet.length; i < l; i++) {
      this.__codes.add(Math.random(), testSet.charCodeAt(i));
    }
    this.code = this.__codes.head();

    this.__timeStamp = 0;
    this.__faster = new Heap();
    this.__slower = new Heap();
  }

  #onKey(e) {
    if (this.__codes.head() === e.charCode) {
      this.__codes.updatePrio(-(2 ** -this.errors));
      this.code = this.__codes.head();
      this.__errors = 0;

      // delta time
      const delta = e.timeStamp - this.__timeStamp;
      this.__timeStamp = e.timeStamp;

      console.log(6e4 / delta);

      // compute new median
      if (delta > this.median) {
        this.__slower.add(-delta, delta);
        if (this.__slower.size() > this.__faster.size()) {
          const x = this.__slower.pop();
          this.__faster.add(x, x);
        }
      } else {
        this.__faster.add(delta, delta);
        if (this.__faster.size() > 1 + this.__slower.size()) {
          const x = this.__faster.pop();
          this.__slower.add(-x, x);
        }
      }
      this.median = 12e4 / (this.__slower.head() + this.__faster.head());
    } else {
      this.__errors += 1;
    }
  }

  render() {
    return html`<div class="main font" tabindex="0" @keypress="${this.#onKey}">
        ${String.fromCharCode(this.code)}
      </div>
      <div class="font">${this.median} p/m</div>`;
  }
}

customElements.define("type-coach", TypeCoach);
