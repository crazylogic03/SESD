

export type Comparator<T> = (a: T, b: T) => number;

export class BinaryHeap<T> {
  private _heap: T[];
  private _comparator: Comparator<T>;

  
  constructor(comparator: Comparator<T>) {
    this._heap = [];
    this._comparator = comparator;
  }

  
  get size(): number {
    return this._heap.length;
  }

  
  get isEmpty(): boolean {
    return this._heap.length === 0;
  }

  
  public peek(): T | undefined {
    return this._heap[0];
  }

  
  public push(value: T): void {
    this._heap.push(value);
    this.bubbleUp(this._heap.length - 1);
  }

  
  public pop(): T | undefined {
    if (this.isEmpty) return undefined;

    const top = this._heap[0];
    const last = this._heap.pop()!;

    if (this._heap.length > 0) {
      this._heap[0] = last;
      this.sinkDown(0);
    }

    return top;
  }

  
  public remove(predicate: (item: T) => boolean): T | undefined {
    const index = this._heap.findIndex(predicate);
    if (index === -1) return undefined;

    const removed = this._heap[index];
    const last = this._heap.pop()!;

    if (index < this._heap.length) {
      this._heap[index] = last;
      this.bubbleUp(index);
      this.sinkDown(index);
    }

    return removed;
  }

  
  public toArray(): T[] {
    return [...this._heap];
  }

  
  public toSortedArray(): T[] {
    return [...this._heap].sort(this._comparator);
  }

  
  public clear(): void {
    this._heap = [];
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this._comparator(this._heap[index], this._heap[parentIndex]) < 0) {
        this.swap(index, parentIndex);
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  private sinkDown(index: number): void {
    const length = this._heap.length;

    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;

      if (
        leftChild < length &&
        this._comparator(this._heap[leftChild], this._heap[smallest]) < 0
      ) {
        smallest = leftChild;
      }

      if (
        rightChild < length &&
        this._comparator(this._heap[rightChild], this._heap[smallest]) < 0
      ) {
        smallest = rightChild;
      }

      if (smallest !== index) {
        this.swap(index, smallest);
        index = smallest;
      } else {
        break;
      }
    }
  }

  private swap(i: number, j: number): void {
    [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
  }
}
