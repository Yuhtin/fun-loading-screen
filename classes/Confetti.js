class Confetti {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = random(-3, 3);
    this.vy = random(-6, -1);
    this.color = color;
    this.life = 60;
    this.size = random(4, 8);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.2;
    this.life--;
  }

  draw() {
    noStroke();
    const c = color(this.color);
    c.setAlpha(map(this.life, 0, 60, 0, 255));
    fill(c);
    rect(this.x, this.y, this.size, this.size);
  }

  dead() {
    return this.life <= 0;
  }
}
