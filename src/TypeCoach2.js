import { css, html, LitElement } from "lit";
import { Heap } from "./Heap";
import { words } from "./words";

function sample(array) {
  return array[(array.length * Math.random()) | 0];
}

function generate() {
  let string = sample(words);
  while (string.length < 200) {
    string += " " + sample(words);
  }
  return string;
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

const WORDS_PER_EXERCISE = 32;

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
    this.keys = [];
    this.median = 0;
    this.offset = 0;
    this.strokeCount = 0;
    this.totalTime = 0;
  }

  connectedCallback() {
    super.connectedCallback();
    this.current = generate();
    this.errorCount = 0;
    this.errors = [];
    this.keys = [];
    this.offset = 0;
  }

  #onKey(e) {
    e.preventDefault();
    const deltaTime = e.timeStamp - this.__timeStamp;
    // store correct presses per minute
    this.__median.add(deltaTime);
    if (deltaTime < 1000) {
      this.totalTime += deltaTime;
      this.strokeCount++;
    }
    this.__timeStamp = e.timeStamp;
    this.median = this.__median.get();
    this.keys[this.offset] = e.key;
    if (this.current[this.offset] !== e.key) {
      this.errors[this.offset] ||= [];
      this.errors[this.offset].push(e.key);
      this.errorCount++;
      TypeCoach.#BEEP.play();
      // this.offset = 0;
      return;
    }

    this.offset++;
    if (this.offset < this.current.length) {
      return;
    }
    if (this.strokeCount / (1 + this.errorCount) < 200) {
      this.offset = 0;
      return;
    }
    this.current = generate();
    this.errorCount = 0;
  }

  render() {
    const done = this.current.substring(0, this.offset);
    const todo = this.current.substring(this.offset);
    return html` <div
        class="main"
        autofocus
        @keypress="${this.#onKey}"
        tabindex="0"
      >
        <span class="done">${done}</span
        ><!--anti space
        --><span class="todo">${todo}</span>
      </div>
      Fouten: ${this.errorCount}. Score:
      ${Math.round(this.strokeCount / (1 + this.errorCount))}/200. Doorsnee tijd
      tussen aanslagen: ${this.median ? Math.round(this.median) : "-"} ms.
      Gemiddeld aantal aanslagen per minuut:
      ${
      this.totalTime
        ? Math.round((6e4 * this.strokeCount) / this.totalTime)
        : "-"
    }.`;
  }
}

customElements.define("type-coach", TypeCoach);
