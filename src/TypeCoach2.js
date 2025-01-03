import { css, html, LitElement } from "lit";
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
    `,
  ];

  static #BEEP = new Beep();

  constructor() {
    super();
    // current string to type
    this.current = generate();
    // offset in current string
    this.offset = 0;
    // number of penalty rounds
    this.penalties = 0;
    // 'in game' total time
    this.totalTime = 0;
  }

  // repeat if errors are make
  #errorCount = 0;
  #lastError = 0;
  #start = 0;
  #strokeRate = 0;
  #timeStamp = 0;

  // give user an optimistic head start
  #durations = [];
  #errors = [];
  #errorRate = 0;

  #computeErrorRate() {
    let errors = 0;
    for (let d = 3e5, i = this.#errors.length - 1; i >= 0; i--) {
      if (d < this.#durations[i]) {
        // interpolate
        errors += (this.#errors[i] * d) / this.#durations[i];
        break;
      }
      d -= this.#durations[i];
      errors += this.#errors[i];
    }
    this.#errorRate = errors / 5;
  }

  #onKey(e) {
    e.preventDefault();

    if (this.offset) {
      this.totalTime += e.timeStamp - this.#timeStamp;
    } else {
      this.#start = e.timeStamp;
    }
    this.#timeStamp = e.timeStamp;

    // check if the key is correct
    if (this.current[this.offset] !== e.key) {
      if (this.totalTime - this.#lastError > 500) {
        this.#lastError = this.totalTime;
        this.#errorCount++;
        // annoy user with a beep
        TypeCoach.#BEEP.play();
      }
      return;
    }

    this.offset++;
    if (this.offset < this.current.length) {
      return;
    }
    this.offset = 0;

    const duration = e.timeStamp - this.#start;
    this.#durations.push(duration);
    this.#errors.push(this.#errorCount);

    this.#strokeRate = ((this.current.length - 1) * 6e4) / duration;
    this.#computeErrorRate();

    if (this.#errorCount || this.#errorRate > 0.75) {
      this.penalties++;
      this.#errorCount = 0;
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
          Fouten per minuut: ${this.#errorRate.toPrecision(3).replace(".", ",")}
          (doel < 0,75).
        </li>
        <li>Strafrondes: ${this.penalties} (doel < 23).</li>
        <li>
          Resterende tijd: ${Math.round((MAX_TIME - this.totalTime) / 1000)}
          seconden.
        </li>
        <li>
          Aanslagen per minuut:
          ${this.#strokeRate.toPrecision(3).replace(".", ",")} (doel ≥ 150).
        </li>
      </ul>`;
  }
}

customElements.define("type-coach", TypeCoach);
