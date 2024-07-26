import { css, html, LitElement, nothing } from "lit";
import { Heap } from "./Heap";
import { AVERAGE_WORD_LENGTH, words } from "../words";

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

const WORDS_PER_EXERCISE = Math.round(MAX_SANCTION / (AVERAGE_WORD_LENGTH + 1));

const TEST_KEY = "testText";

export class TypeCoach extends LitElement {
  static properties = {
    current: { type: String },
    offset: { type: Number },
    median: { type: Number },
  };

  static styles = [
    css`
      :host {
        margin: auto;
        display: flex;
        flex-direction: column;
        color: #333333;
      }
      .main {
        font-family: serif;
        font-size: 2em;
        font-weight: bold;
        color: #999999;
        border: 1px solid #333333;
      }
      .main:focus {
        color: #333333;
      }
      .done {
        background: #33ff33;
      }
      .retry {
        background: #ff3333;
      }
      .errors {
        display: flex;
      }
    `,
  ];

  static #BEEP = new Beep();

  constructor() {
    super();
    this.current = "";
    this.offest = 0;
    this.median = 0;
    this.__timeStamp = 0;
    this.__median = new RunningMedian();
  }

  connectedCallback() {
    super.connectedCallback();
    this.current = window.localStorage.getItem(TEST_KEY);
    if (!this.current) {
      this.current = generate();
      window.localStorage.setItem(TEST_KEY, this.current);
    }
    this.offset = 0;
    this.max = 0;
    this.errors = [];
  }

  #onKey(e) {
    e.preventDefault();
    if (this.current[this.offset] !== e.key) {
      this.errors.push([this.offset, this.current[this.offset], e.key]);
      TypeCoach.#BEEP.play();
      if (this.offset < MAX_SANCTION) {
        this.offset = 0;
      } else {
        this.offset -= MAX_SANCTION;
      }
      return;
    }
    const diff = e.timeStamp - this.__timeStamp;
    // store correct presses per minute
    this.__median.add(6e4 / diff);
    this.__timeStamp = e.timeStamp;
    this.median = this.__median.get();

    this.offset++;
    if (this.offset > this.max) {
      this.max = this.offset;
    }
    if (this.offset < this.current.length) {
      return;
    }
    this.current = generate();
    window.localStorage.setItem(TEST_KEY, this.current);
    this.offset = 0;
    this.max = 0;
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
      <p>Around ${this.median} successes per minute.</p>
      <p>Errors: ${this.#errorLists()}</p>
    `;
  }

  #errorLists() {
    const result = [];
    for (let i = 0, l = this.errors.length; i < l; i += 25) {
      result.push(this.#errorList(i));
    }
    return html`<div class="errors">${result}</div>`;
  }

  #errorList(i) {
    const result = [];
    for (let j = i, l = this.errors.length; j < l && j < i + 25; j++) {
      const [x, e, a] = this.errors[j];
      result.push(html`<li>'${a}' instead of '${e}' at ${x}</li>`);
    }
    return html`<ul>
      ${result}
    </ul>`;
  }
}

customElements.define("type-coach", TypeCoach);
