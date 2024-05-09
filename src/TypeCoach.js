import { css, html, LitElement } from "lit";
import { Heap } from "./Heap";

const testSet =
  "qwertyuiop[]QWERTYUIOP{}asdfghjkl;'ASDFGHJKL:\"zxcvbnm,./ZXCVBNM<>?";

class RunningMedian {
  #lower = new Heap();
  #higher = new Heap();
  #balance() {
    return this.#lower.size() - this.#higher.size();
  }
  add(value) {
    if (value < this.#higher.head()) {
      this.#lower.add(value, value);
      while (this.#balance() > 1) {
        const v = this.#lower.pop();
        this.#higher.add(-v, v);
      }
    } else {
      this.#higher.add(-value, value);
      while (this.#balance() < 0) {
        const v = this.#higher.pop();
        this.#lower.add(v, v);
      }
    }
  }
  get() {
    if (this.#balance() > 0) {
      return this.#lower.head();
    }
    return (this.#lower.head() + this.#higher.head()) / 2;
  }
}

export class TypeCoach extends LitElement {
  static properties = {
    current: { type: Object },
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
    this.median = 0;
    this.__items = [];
    this.__codes = new Heap();
    for (let i = 0, l = testSet.length; i < l; i++) {
      this.__items[i] = {
        code: testSet.charCodeAt(i),
        score: 0,
      };
      this.__codes.add(Math.random() * .1, this.__items[i]);
    }
    this.current = this.__codes.head();
    this.__timeStamp = 0;
    this.__median = new RunningMedian();
    this.__hardCaseThreshold = 0;
  }

  #onKey(e) {
    if (this.current.code === e.charCode) {
      this.current.score++;
      this.__codes.updatePrio(-(2 ** this.current.score));
      this.current = this.__codes.head();
      // store correct presses per minute
      this.__median.add(12e4 / (e.timeStamp - this.__timeStamp));
      this.__timeStamp = e.timeStamp;
      this.median = this.__median.get();

      // there is a smarter way
      if (this.__items.every((it) => it.score > this.__hardCaseThreshold)) {
        this.__hardCaseThreshold++;
      }
    } else {
      this.current.score--;
    }
  }

  render() {
    return html`
      <h1>
        Next symbol:
        <span class="main" tabindex="0" @keypress="${this.#onKey}">
          ${String.fromCharCode(this.current.code)}
  </span>
      </h1>
      Around ${this.median} successes per minute.
      <h1>Level ${this.__hardCaseThreshold} hard cases</h1>
      ${
      this.__items.map(
        (it) =>
          html`<span ?hidden="${it.score > this.__hardCaseThreshold}"
            >${String.fromCharCode(it.code)}</span
          >`,
      )
    }
    `;
  }
}

customElements.define("type-coach", TypeCoach);
