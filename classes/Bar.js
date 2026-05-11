class Bar {
  constructor(x, w, baseY, baseH, color, label) {
    this.x = x;
    this.w = w;
    this.baseY = baseY;
    this.baseH = baseH;
    this.h = baseH;
    this.color = color;
    this.label = label;
    this.phase = random(TWO_PI);

    this.knocked = false;
    this.dead = false;
    this.kx = x;
    this.ky = baseY - baseH;
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;
    this.spin = 0;
  }

  update() {
    if (this.dead) return;

    if (!this.knocked) {
      const breath = sin(millis() / 600 + this.phase) * this.baseH * 0.04;
      this.h = this.baseH + breath;
      return;
    }

    this.vy += 0.7;
    this.kx += this.vx;
    this.ky += this.vy;
    this.angle += this.spin;

    if (this.ky > height + 200 || this.kx < -300 || this.kx > width + 300) {
      this.dead = true;
    }
  }

  draw() {
    if (this.dead) return;

    if (!this.knocked) {
      noStroke();
      fill(this.color);
      rect(this.x, this.baseY - this.h, this.w, this.h, 4, 4, 0, 0);
      return;
    }

    push();
    translate(this.kx + this.w / 2, this.ky + this.h / 2);
    rotate(this.angle);
    noStroke();
    fill(this.color);
    rect(-this.w / 2, -this.h / 2, this.w, this.h, 4);
    pop();
  }

  tryKnock(mx, my, mvx, mvy) {
    if (this.knocked || this.dead) return false;
    const top = this.baseY - this.h;
    if (mx < this.x || mx > this.x + this.w) return false;
    if (my < top || my > this.baseY) return false;

    this.knocked = true;
    this.kx = this.x;
    this.ky = top;

    const speed = 22 + random(0, 10);
    const ang = random(-PI * 0.85, -PI * 0.15);
    this.vx = cos(ang) * speed + mvx * 0.6;
    this.vy = sin(ang) * speed + mvy * 0.6;

    if (Math.abs(mvx) + Math.abs(mvy) < 4) {
      this.vx += random(-12, 12);
      this.vy += random(-18, -8);
    }

    this.spin = random(-0.35, 0.35);
    return true;
  }
}
