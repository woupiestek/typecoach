import { css, html, LitElement, nothing } from "lit";
import { Heap } from "./Heap";
import { words } from "./words";

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = ((i + 1) * Math.random()) | 0;
    const char = array[i];
    array[i] = array[j];
    array[j] = char;
  }
}

function sample(array) {
  return array[(array.length * Math.random()) | 0];
}

function generate() {
  return Array.from({ length: WORDS_PER_EXERCISE })
    .map((_) => sample(words))
    .join(" ");
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

class Beep {
  #context = new AudioContext();
  #on = false;

  async play() {
    if (this.#on) {
      return;
    }
    this.#on = false;
    const oscillator = this.#context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = 800;
    oscillator.connect(this.#context.destination);
    oscillator.start();
    return new Promise((resolve) => {
      setTimeout(() => {
        oscillator.stop();
        this.#on = false;
        resolve();
      }, 100);
    });
  }
}

// consider letting the length of the exercise & sanction grow over time
const MAX_SANCTION = 200;

const WORDS_PER_EXERCISE = 25;

const TEST_KEY = "testText";

export class TypeCoach extends LitElement {
  static properties = {
    current: { type: String },
    offset: { type: Number },
    median: { type: Number },
    errorCount: { type: Number },
  };

  static styles = [
    css`
      :host {
        margin: auto;
        display: flex;
        flex-direction: column;
        background: #333333;
        color: #cccccc;
      }
      .main {
        font-family: serif;
        font-size: 2em;
        font-weight: bold;
        color: #666666;
        border: 4px solid #cccccc;
        border-radius: 4px;
        height: 200px;
      }
      .main:focus {
        color: #cccccc;
        outline: none;
      }
      .done {
        background: #339933;
      }
      .retry {
        background: #993333;
      }
      .errors {
        display: flex;
        flex-wrap: wrap;
      }
    `,
  ];

  static #BEEP = new Beep();

  constructor() {
    super();
    this.__median = new RunningMedian();
    this.__timeStamp = 0;
    this.current = "";
    this.errorCount = 0;
    this.errors = [];
    this.median = 0;
    this.offset = 0;
  }

  connectedCallback() {
    super.connectedCallback();
    this.current = generate();
    this.errorCount = 0;
    this.errors = [];
    this.max = 0;
    this.offset = 0;
  }

  #onKey(e) {
    e.preventDefault();
    // store correct presses per minute
    this.__median.add(e.timeStamp - this.__timeStamp);
    this.__timeStamp = e.timeStamp;
    this.median = this.__median.get();

    if (this.current[this.offset] !== e.key) {
      this.errors[this.offset] ||= [];
      this.errors[this.offset].push(e.key);
      this.errorCount++;
      TypeCoach.#BEEP.play();
      if (this.offset < MAX_SANCTION) {
        this.offset = 0;
      } else {
        this.offset -= MAX_SANCTION;
      }
      return;
    }

    this.offset++;
    if (this.offset > this.max) {
      this.max = this.offset;
    }
    if (this.offset < this.current.length) {
      return;
    }
    this.current = generate();
    this.offset = 0;
    this.max = 0;
    this.errorCount = 0;
    this.errors = [];
  }

  render() {
    const done = this.current.substring(0, this.offset);
    const retry = this.current.substring(this.offset, this.max);
    const todo = this.current.substring(this.max);
    return html`
      <div class="main" autofocus @keypress="${this.#onKey}" tabindex="0">
        <span class="done">${done}</span
        ><!--anti space
        --><span class="retry">${retry}</span
        ><!--anti space
        --><span class="todo">${todo}</span>
      </div>
      <div class="main">${this.#replacements()}</div>
      Around ${Math.round(this.median)} ms per stroke (> 400 ms target).
      ${this.errorCount} errors: ${this.#errors()}
    `;
  }

  #replacements() {
    return Array.from(this.current.slice(0, this.max + 1)).map((c, i) => {
      if (this.errors[i] === undefined) {
        return html`${c}`;
      }
      return html`<span style="color:#cc3333;"
        >${this.errors[i][this.errors[i].length - 1]}</span
      >`;
    });
  }

  #errors() {
    const array = [];
    for (let i = 0; i <= this.max; i++) {
      if (!this.errors[i]?.length) continue;
      array.push(
        html`<li>
          '${this.errors[i].join("', '")}' for '${this.current[i]}' at ${i}
        </li>`,
      );
    }
    console.log(array);
    const result = [];
    for (let i = 0, l = array.length; i < l; i += 25) {
      result.push(
        html`<ul>
          ${array.slice(i, i + 25)}
        </ul>`,
      );
    }
    return html`<div class="errors">${result}</div>`;
  }
}

customElements.define("type-coach", TypeCoach);
