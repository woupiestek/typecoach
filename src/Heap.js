/** @typedef {null|{prio: number, head: unknown, tail: Heap[]}} Node */

export class Heap {
  #size = 0;
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
  head() {
    return this.#node?.head;
  }
  add(prio, head) {
    this.#node = Heap.#merge(this.#node, { prio, head: head, tail: [] });
    this.#size++;
  }
  updatePrio(delta) {
    if (!this.#node) {
      return;
    }
    this.add(this.#node.prio + delta, this.#node.head);
    this.pop();
  }
  pop() {
    if (!this.#node) {
      return;
    }
    const { head, tail } = this.#node;
    let node = null;
    const l = tail.length;
    if (l === 0) {
      this.#node = null;
      this.#size = 0;
      return head;
    }
    let i = 1;
    if (l % 2 === 1) {
      node = tail[0];
      i = 2;
    }
    for (; i < l; i += 2) {
      // reverse the order here, so older element have a change to get up front
      node = Heap.#merge(node, Heap.#merge(tail[i - 1], tail[i]));
    }
    this.#node = node;
    this.#size--;
    return head;
  }
  size() {
    return this.#size;
  }
}
