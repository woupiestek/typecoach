/** @typedef {null|{prio: number, head: unknown, tail: Heap[]}} Node */

export class Heap {
  /** @type {Node} */
  #node = null;
  /**
   * @param {Node} a
   * @param {Node} b
   * @returns {Node}
   */
  static #merge(a, b) {
    if (!a) return b;
    if (!b) return a;
    if (b.prio > a.prio) {
      b.tail.push(a);
      return b;
    } else {
      a.tail.push(b);
      return a;
    }
  }
  findMin() {
    return this.#node?.head;
  }
  insert(prio, head) {
    this.#node = Heap.#merge(this.#node, { prio, head, tail: [] });
  }
  deleteMin() {
    if (!this.#node) {
      return;
    }
    const { tail } = this.#node;
    const l = tail.length;
    let node = null;
    if (l === 0) return;
    let i = 1;
    if (l % 2 === 1) {
      node = tail[0];
      i = 2;
    }
    for (; i < l; i += 2) {
      // reverse the order here, so older element have a change to get up front
      node = Heap.#merge(Heap.#merge(tail[i], tail[i - 1]), node);
    }
    this.#node = node;
  }
}
