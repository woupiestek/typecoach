import { css, html, LitElement } from "lit";
import { words } from "./words";

function sample(array) {
  return array[(array.length * Math.random()) | 0];
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = (i * Math.random()) | 0;
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function generate() {
  let string = sample(words);
  let s;
  for (;;) {
    s = sample(words);
    if (s.length + string.length * 2 >= 200) {
      break;
    }
    string += " " + s;
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

  // current batch of text strings
  #input = [generate()];
  // next batch of test strings
  #output = [];

  #generate() {
    if (!this.#input.length) {
      this.#input = this.#output;
      for (let i = 0, l = 1 + this.#input.length; i < l; i++) {
        this.#input.push(generate());
      }
      shuffle(this.#input);
      this.#output = [];
    }
    this.current = this.#input.pop();
    this.offset = 0;
  }

  constructor() {
    super();
    // current string to type
    this.#generate();
    // number of penalty rounds
    this.penalties = 0;
    // 'in game' total time
    this.totalTime = 0;
  }

  #start = 0;
  #strokeRate = 0;
  #timeStamp = 0;

  #onKey(e) {
    e.preventDefault();

    if (this.offset) {
      this.totalTime += e.timeStamp - this.#timeStamp;
      this.#strokeRate =
        ((this.offset - 1) * 6e4) / (e.timeStamp - this.#start);
    } else {
      this.#start = e.timeStamp;
    }
    this.#timeStamp = e.timeStamp;

    // check if the key is correct
    if (this.current[this.offset] !== e.key) {
      if (!this.offset) {
        // forgive the first error
        return;
      }
      // annoy user with a beep
      TypeCoach.#BEEP.play();
      this.penalties++;
      // do this one more often
      this.#output.push(this.current);
      this.offset = 0;
      return;
    }

    this.offset++;
    if (this.offset < this.current.length) {
      return;
    }
    this.#generate();
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
        <span class="done">${done}</span>${todo}
      </div>
      <ul>
        <li>
          Fouten per minuut:
          ${this.totalTime
            ? ((6e4 * this.penalties) / this.totalTime)
                .toPrecision(3)
                .replace(".", ",")
            : "-"}
          (doel < 0,75).
        </li>
        <li>
          Resterende tijd: ${Math.round((MAX_TIME - this.totalTime) / 1000)}
          seconden.
        </li>
        <li>
          Aanslagen per minuut:
          ${this.#strokeRate.toPrecision(3).replace(".", ",")} (doel ≥ 150).
        </li>
        <li>Wachtrij: ${this.#input.length + 2 * this.#output.length}</li>
      </ul>`;
  }
}

customElements.define("type-coach", TypeCoach);
