import { css, html, LitElement } from "lit";
import { Heap } from "./Heap";

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = ((i + 1) * Math.random()) | 0;
    const char = array[i];
    array[i] = array[j];
    array[j] = char;
  }
}

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
    current: { type: Array },
    offset: { type: Number },
    median: { type: Number },
  };

  static styles = [
    css`
      .font {
      }
      .main {
        cursor: pointer;
        font-size: 2em;
        font-weight: bold;
        font-family: serif;
        border: 2px solid black;
        border-radius: 5px;
        width: 640px;
        margin: auto;
        text-align: center;
      }
      .main:focus > span[underline] {
        animation: blinker 1s linear infinite;
      }
      @keyframes blinker {
        50% {
          opacity: 0;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.current = Array.from(
      "\"',./:;<>?ABCDEFGHIJKLMNOPQRSTUVWXYZ[]abcdefghijklmnopqrstuvwxyz{}",
    );
    shuffle(this.current);
    this.offset = 0;
    this.__errors = 0;
    this.__done = [];
    this.median = 0;
    this.__timeStamp = 0;
    this.__median = new RunningMedian();
  }

  #onKey(e) {
    if (this.current[this.offset].charCodeAt(0) !== e.charCode) {
      this.__errors++;
      return;
    }
    const diff = e.timeStamp - this.__timeStamp;
    this.__errors += (diff / 400) | 0;
    // store correct presses per minute
    this.__median.add(12e4 / diff);
    this.__timeStamp = e.timeStamp;
    this.median = this.__median.get();

    (this.__done[this.__errors] ||= []).push(this.current[this.offset]);
    this.__errors = 0;
    this.offset++;
    if (this.offset < this.current.length) {
      return;
    }

    do {
      this.current = this.__done.pop();
    } while (this.current === undefined);
    shuffle(this.current);
    this.offset = 0;
  }

  render() {
    return html`
      <div autofocus class="main" @keypress="${this.#onKey}" tabindex="0">
        ${
      this.current.map(
        (it, idx) =>
          html`
            <span ?underline="${idx === this.offset}">${it}</span>
          `,
      )
    }
      </div>
      Around ${this.median} successes per minute.
      <h1>Done</h1>
      ${this.__done.map((row) => html`<p>${row}</p>`)}
    `;
  }
}

customElements.define("type-coach", TypeCoach);
