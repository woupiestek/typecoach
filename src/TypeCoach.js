import { css, html, LitElement, nothing } from "lit";
import { Heap } from "./Heap";
import { words } from "../nwt2";

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

const WORDS_PER_EXERCISE = 20;

const TEST_KEY = "testText";

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

export class TypeCoach extends LitElement {
  static properties = {
    current: { type: Array },
    offset: { type: Number },
    median: { type: Number },
  };

  static styles = [
    css`
      :host {
        margin: auto;
        display: flex;
        flex-direction: column;
      }
      textarea {
        font-family: serif;
        font-size: 2em;
        font-weight: bold;
        resize: none;
      }
    `,
  ];

  static #BEEP = new Beep();

  constructor() {
    super();
    this.current = "";
    this.offset = 0;
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
    this.__score = 0;
  }

  #onKey(e) {
    e.preventDefault();
    if (this.current[this.offset] !== e.key) {
      this.__expected = this.current[this.offset];
      this.__actual = e.key;
      const score = (this.offset / this.current.length) * 100;
      if (this.__score < score) {
        this.__score = score;
      }
      TypeCoach.#BEEP.play();
      if (this.offset < 20) {
        this.offset = 0;
      } else {
        this.offset -= 20;
      }
      e.target.setSelectionRange(this.offset, this.offset + 1);
      return;
    }
    const diff = e.timeStamp - this.__timeStamp;
    // store correct presses per minute
    this.__median.add(6e4 / diff);
    this.__timeStamp = e.timeStamp;
    this.median = this.__median.get();

    this.offset++;
    e.target.setSelectionRange(this.offset, this.offset + 1);
    if (this.offset < this.current.length) {
      return;
    }
    this.current = generate();
    window.localStorage.setItem(TEST_KEY, this.current);
    this.offset = 0;
    e.target.setSelectionRange(0, 1);
  }

  render() {
    return html`
      <textarea
        @keypress="${this.#onKey}"
        @focus="${(e) =>
          e.target.setSelectionRange(this.offset, this.offset + 1)}"
        autofocus
        readonly
        rows="10"
      >
${this.current}</textarea
      >
      <p>Around ${this.median} successes per minute.</p>
      <p>Score: ${this.__score}</p>
      <p>
        ${this.__expected
          ? `Failure: '${this.__actual}' instead of '${this.__expected}'!`
          : nothing}
      </p>
    `;
  }
}

customElements.define("type-coach", TypeCoach);
