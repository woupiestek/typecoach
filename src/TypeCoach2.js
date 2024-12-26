import { css, html, LitElement } from "lit";
import { Heap } from "./Heap";
import { words } from "./words";

function sample(array) {
  return array[(array.length * Math.random()) | 0];
}

function generate() {
  let string = sample(words);
  while (string.length < 100) {
    string += " " + sample(words);
  }
  return string;
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

const TEST_PERIOD = 3.2e5;
const MINUTE = 6e4 / TEST_PERIOD;
const MAX_TIME = 1.8e6;

export class TypeCoach extends LitElement {
  static properties = {
    current: { type: String },
    offset: { type: Number },
    totalTime: { type: Number },
    penalties: { type: Number },
  };

  static styles = [
    css`
      :host {
        margin: auto;
        display: flex;
        flex-direction: column;
        background: #333333;
        color: #cccccc;
        align-items: center;
      }
      .main {
        font-family: serif;
        font-size: 2em;
        font-weight: bold;
        color: #666666;
        border: 4px solid #cccccc;
        border-radius: 4px;
        max-width: 800px;
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
    this.__timeStamp = 0;
    // repeat if errors are make
    this.__erred = false;
    // current string to type
    this.current = generate();
    // timestamps of errors
    this.errors = [];
    this.strokes = [];
    // offset in current string
    this.offset = 0;
    // number of penalty rounds
    this.penalties = 0;
    // 'in game' total time
    this.totalTime = 0;
  }

  #onKey(e) {
    e.preventDefault();

    if (this.offset) {
      this.totalTime += e.timeStamp - this.__timeStamp;
      this.strokes.push(this.totalTime);
    }
    this.__timeStamp = e.timeStamp;

    // check if the key is correct
    if (this.current[this.offset] !== e.key) {
      if (this.totalTime - (this.errors[this.errors.length - 1] || 0) > 500) {
        this.errors.push(this.totalTime);
      }
      this.__erred = true;
      // annoy user with a beep
      TypeCoach.#BEEP.play();
      return;
    }
    this.offset++;
    if (this.offset < this.current.length) {
      return;
    }
    this.offset = 0;
    // forget strokes older than a minute
    this.strokes = this.strokes.filter(
      (t) => this.totalTime - t < 6e4,
    );
    // forget errors older than TEST_PERIOD
    this.errors = this.errors.filter((t) => this.totalTime - t < TEST_PERIOD);
    // penalty round if too many errors
    if (this.__erred || this.#errorRate() > 0.75) {
      this.__erred = false;
      this.penalties++;
      return;
    }
    this.current = generate();
  }

  render() {
    // replace spaces to show line breaks
    const done = this.current
      .substring(0, this.offset)
      .replaceAll(" ", "\u200B\u00A0");
    const todo = this.current
      .substring(this.offset)
      .replaceAll(" ", "\u200B\u00A0");
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
      <ul>
        <li>
          Fouten per minuut:
          ${this.#errorRate().toPrecision(3).replace(".", ",")} (doel < 0,75).
        </li>
        <li>Strafrondes: ${this.penalties} (doel < 23).</li>
        <li>
          Resterende tijd: ${Math.round((MAX_TIME - this.totalTime) / 1000)}
          seconden.
        </li>
        <li>
          Tijd sinds laatste fout: ${this.#secondsSinceLastError()} seconden.
        </li>
        <li>
          Aanslagen per minuut:
          ${this.#successRate().toPrecision(3).replace(".", ",")} (doel ≥ 150).
        </li>
      </ul>`;
  }

  #successRate() {
    return (
      this.strokes.filter((t) => this.totalTime - t < 6e4).length
    );
  }

  #errorRate() {
    return (
      this.errors.filter((t) => this.totalTime - t < TEST_PERIOD).length *
      MINUTE
    );
  }

  #secondsSinceLastError() {
    return Math.round(
      (this.totalTime - (this.errors[this.errors.length - 1] || 0)) / 1000,
    );
  }
}

customElements.define("type-coach", TypeCoach);
