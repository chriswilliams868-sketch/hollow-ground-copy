// Persistent skill objects in the world (smoke clouds, satchel bombs).
export class Hazards {
  constructor() {
    this.items = [];
  }

  add(item) {
    this.items.push(item);
  }

  update(dt) {
    for (let i = this.items.length - 1; i >= 0; i -= 1) {
      if (!this.items[i].update(dt)) {
        this.items[i].dispose();
        this.items.splice(i, 1);
      }
    }
  }

  clear() {
    this.items.forEach((item) => item.dispose());
    this.items = [];
  }
}