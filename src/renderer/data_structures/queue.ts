export class Queue<T> {
  public constructor(
    private elements: Record<number, T> = {},
    private head: number = 0,
    private tail: number = 0
  ) {}

  /**
   * Adds an element to the queue.
   *
   * @param {T} element - The element to be added.
   * @return {void} This function does not return anything.
   */
  public enqueue(element: T): void {
    this.elements[this.tail] = element;
    this.tail++;
  }

  /**
   * Removes and returns the first element from the queue.
   *
   * @return {T} The first element from the queue.
   */
  public dequeue(): T {
    const item = this.elements[this.head];
    delete this.elements[this.head];
    this.head++;

    return item;
  }

  /**
   * Returns the top element of the stack without removing it.
   *
   * @return {T} The top element of the stack.
   */
  public peek(): T {
    return this.elements[this.head];
  }

  /**
   * Returns the length of the array.
   *
   * @return {number} The length of the array.
   */
  public get length(): number {
    return this.tail - this.head;
  }

  /**
   * A method that checks if the object is empty.
   *
   * @return {boolean} Returns true if the object is empty, otherwise false.
   */
  public get isEmpty(): boolean {
    return this.length === 0;
  }
}
