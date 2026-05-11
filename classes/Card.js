class Card {
  constructor(x, y, img, targetW) {
    this.x = x;
    this.y = y;
    this.img = img;
    this.w = targetW;
    this.h = (img.height / img.width) * targetW;
    this.vx = random([-1, 1]) * random(2, 3.2);
    this.vy = random([-1, 1]) * random(2, 3.2);
    this.collected = false;
    this.collectAnim = 0;
  }

  update() {
    if (this.collected) return;

    if (this.collectAnim > 0) {
      this.collectAnim += 0.08;
      if (this.collectAnim >= 1) this.collected = true;
      return;
    }

    this.x += this.vx;
    this.y += this.vy;
    if (this.x <= 0 || this.x + this.w >= width)       this.vx *= -1;
    if (this.y <= 80 || this.y + this.h >= height - 60) this.vy *= -1;
  }

  draw() {
    if (this.collected) return;

    push();
    imageMode(CORNER);
    if (this.collectAnim > 0) {
      const t = this.collectAnim;
      const scale = 1 + t * 0.5;
      translate(this.x + this.w / 2, this.y + this.h / 2);
      drawingContext.globalAlpha = 1 - t;
      image(this.img, -this.w * scale / 2, -this.h * scale / 2, this.w * scale, this.h * scale);
      drawingContext.globalAlpha = 1;
    } else {
      image(this.img, this.x, this.y, this.w, this.h);
    }
    pop();
  }

  contains(mx, my) {
    if (this.collected || this.collectAnim > 0) return false;
    return mx >= this.x && mx <= this.x + this.w && my >= this.y && my <= this.y + this.h;
  }

  collect() {
    this.collectAnim = 0.01;
  }
}
