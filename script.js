let t = 0, jumpY = 0, vy = 0, nextAuto = 150, spin = 0, flipping = false, parts = [];
const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
const speed = reduce ? 1 : 4;
const mod = (a, n) => ((a % n) + n) % n;

function setup() {
  const c = createCanvas(windowWidth, windowHeight);
  c.parent("stage");
}
function windowResized() { resizeCanvas(windowWidth, windowHeight); }

function jump() {
  if (jumpY === 0) vy = -15;
  else if (!flipping) { // second press in the air = backflip
    flipping = true; spin =0;
    burst(width * 0.36, height * 0.62, 24, ["#ff1493", "#ffd23f", "#3bceac", "#ffffff"], 6);
  }
}
function mousePressed() { jump(); }
function touchStarted() { jump(); return false; }
function keyPressed() { if (key === " ") { jump(); return false; } }

function draw() {
  t += speed;
  const groundY = height * 0.78;   // top of the boardwalk
  const horizon = height * 0.44;
  const shoreY = height * 0.64;
  const s = constrain(min(width, height) / 520, 0.6, 1.8);

  if (--nextAuto <= 0) { jump(); nextAuto = 2000 + random(0); }
  if (jumpY !== 0 || vy !== 0) {
    vy += 0.6; jumpY += vy;
    if (jumpY >= 0) {
      jumpY = 0; vy = 0;
      burst(width * 0.70, groundY + 28 * s, 16, ["#f6e3b4", "#e2c48c", "#ffffff"], 3);
    }
  }
  if (flipping) { spin += .4; if (spin >= TWO_PI) { flipping = false; spin = 0; } }

  drawSky(horizon, s);
  drawSea(horizon, shoreY, s);
  drawBeach(shoreY, groundY, s);
  drawPalms(groundY, s);
  drawBoardwalk(groundY, s);
  fill(255, 110, 60, 55 * dusk()); rect(0, 0, width, height); // sunset glow

  // capybara + board
  const bob = jumpY === 0 ? sin(t * 0.25) * 1.2 * s : 0;
  push();
  translate(width * 0.36, groundY + 18 * s - 24 * s + jumpY * s + bob);
  scale(s);
  rotate((jumpY !== 0 ? radians(-8 + vy * 0.9) : 0) + spin);
  drawBoard();
  drawCapybara();
  pop();

  // wheel sparks + particles
  if (jumpY === 0 && frameCount % 2 === 0)
    for (const wx of [-45, 45])
      parts.push({ x: width * 0.36 + wx * s, y: groundY + 30 * s, vx: random(-4, -1.5), vy: random(-2.5, -0.5),
        life: random(12, 24), max: 24, c: random(["#ffd23f", "#ff7f50", "#ffffff"]), r: random(1.5, 3.5) * s });
  updateParts();

  // speed lines
  stroke(255, 255, 255, 170); strokeWeight(3 * s);
  for (let i = 0; i < 4; i++) {
    const ly = groundY + (4 - i * 22) * s;
    const lx = width * 0.36 - (110 + ((t * 2 + i * 60) % 120)) * s;
    line(lx, ly, lx - 40 * s, ly);
  }
  noStroke();
}

function drawSky(horizon, s) {
  for (let y = 0; y < horizon; y += 4) {
    stroke(lerpColor(lerpColor(color("#3aa8ee"), color("#4a2480"), dusk()),
      lerpColor(color("#c9efff"), color("#ffb36b"), dusk()), y / horizon));
    line(0, y, width, y);
  }
  noStroke();
  // stars come out at dusk
  for (let i = 0; i < 50; i++) {
    fill(255, 255, 255, 255 * max(0, dusk() - 0.45) * 1.8 * (0.5 + 0.5 * sin(t * 0.05 + i)));
    circle((i * 137) % width, ((i * 61) % 100) / 100 * horizon * 0.8, 2.2 * s);
  }
  // sun with glow
  const sx = width * 0.8, sy = height * (0.16 + 0.26 * dusk());
  fill(255, 245, 190, 70); circle(sx, sy, 190 * s);
  fill(255, 245, 190, 120); circle(sx, sy, 130 * s);
  fill("#fff6c2"); circle(sx, sy, 80 * s);
  // clouds
  fill(255, 255, 255, 235);
  const span = width + 300;
  for (let i = 0; i < 4; i++) {
    const cx = mod(i * 380 - t * 0.25, span) - 150;
    const cy = height * (0.08 + 0.06 * ((i * 2) % 4));
    ellipse(cx, cy, 130 * s, 34 * s);
    ellipse(cx + 32 * s, cy - 14 * s, 76 * s, 36 * s);
    ellipse(cx - 32 * s, cy - 8 * s, 62 * s, 28 * s);
  }
  // seagulls
  push(); noFill(); stroke(255); strokeWeight(2.5 * s);
  for (let i = 0; i < 3; i++) {
    const gx = mod(i * 420 + t * 0.6, width + 200) - 100;
    const gy = height * (0.2 + 0.05 * i) + sin(t * 0.02 + i) * 10 * s;
    const w = 13 * s, f = sin(t * 0.12 + i * 2) * 6 * s;
    line(gx - w, gy - f, gx, gy); line(gx, gy, gx + w, gy - f);
  }
  pop();
}

function drawSea(horizon, shoreY, s) {
  const bottom = shoreY + 40 * s;
  for (let y = horizon; y < bottom; y += 3) {
    const k = constrain((y - horizon) / (bottom - horizon), 0, 1);
    stroke(lerpColor(color("#1d8fc0"), color("#6eead6"), pow(k, 0.8)));
    line(0, y, width, y);
  }
  noStroke();
  // sailboat drifting on the horizon
  const bx = mod(width * 0.2 + t * 0.08, width + 200) - 100;
  fill("#ffffff"); triangle(bx, horizon - 4, bx, horizon - 34 * s, bx + 20 * s, horizon - 4);
  fill("#ffd6a5"); triangle(bx - 3, horizon - 4, bx - 3, horizon - 26 * s, bx - 16 * s, horizon - 4);
  fill("#7a5230"); rect(bx - 12 * s, horizon - 4, 38 * s, 4 * s, 2);
  // sparkles
  stroke(255, 255, 255);
  for (let i = 0; i < 46; i++) {
    const x = mod(i * 97 - t * (0.15 + (i % 3) * 0.1), width);
    const y = horizon + 6 + mod(i * 53, max(10, bottom - horizon - 20));
    const a = 60 + 190 * max(0, sin(t * 0.04 + i * 1.7));
    stroke(255, 255, 255, a); strokeWeight(2 * s);
    line(x, y, x + (6 + (i % 4) * 3) * s, y);
  }
  noStroke();
}

function drawBeach(shoreY, groundY, s) {
  const wave = (x, off) => shoreY + sin((x + t * 0.5) * 0.015 + off) * 7 * s;
  // foam line
  noFill(); stroke(255, 255, 255, 220); strokeWeight(7 * s);
  beginShape();
  for (let x = 0; x <= width + 10; x += 10) vertex(x, wave(x, 0) - 3 * s);
  endShape();
  noStroke();
  // sand
  fill("#f6e3b4");
  beginShape();
  for (let x = 0; x <= width + 10; x += 10) vertex(x, wave(x, 0));
  vertex(width, groundY); vertex(0, groundY);
  endShape(CLOSE);
  // wet sand edge
  fill(226, 196, 140, 120);
  beginShape();
  for (let x = 0; x <= width + 10; x += 10) vertex(x, wave(x, 0));
  for (let x = width; x >= 0; x -= 10) vertex(x, wave(x, 0) + 12 * s);
  endShape(CLOSE);
}

function drawPalms(groundY, s) {
  const gapX = 430 * s;
  const n = ceil(width / gapX) + 2;
  const span = n * gapX;
  for (let i = 0; i < n; i++) {
    const x = mod(i * gapX - t * 0.9, span) - gapX;
    const h = (150 + (i * 53) % 60) * s;
    drawPalm(x, groundY - 4 * s, h, s, i * 1.3);
  }
}

function drawPalm(x, baseY, h, s, seed) {
  const sway = sin(t * 0.02 + seed) * 6 * s;
  const tx = x + 34 * s + sway, ty = baseY - h;
  noFill(); stroke("#7a5230"); strokeWeight(10 * s);
  bezier(x, baseY, x - 12 * s, baseY - h * 0.4, x + 10 * s, baseY - h * 0.75, tx, ty);
  noStroke();
  const len = 78 * s;
  for (let k = 0; k < 9; k++) {
    const a = -PI * 0.97 + k * (PI * 0.94 / 8) + sin(t * 0.03 + seed + k) * 0.05;
    push(); translate(tx, ty); rotate(a);
    fill(k % 2 ? "#2e8b4f" : "#3aa65f");
    ellipse(len * 0.5, 0, len, 12 * s);
    translate(len * 0.9, 0); rotate(cos(a) < 0 ? -0.7 : 0.7);
    ellipse(len * 0.25, 0, len * 0.55, 9 * s);
    pop();
  }
  fill("#5b3a1e"); circle(tx - 5 * s, ty + 8 * s, 11 * s); circle(tx + 6 * s, ty + 10 * s, 11 * s);
}

function drawBoardwalk(groundY, s) {
  // railing behind the rider
  const postGap = 150 * s;
  stroke("#d9b98a"); strokeWeight(5 * s);
  line(0, groundY - 28 * s, width, groundY - 28 * s);
  line(0, groundY - 14 * s, width, groundY - 14 * s);
  strokeWeight(9 * s);
  for (let x = -mod(t * 1.0, postGap) - postGap; x < width + postGap; x += postGap)
    line(x, groundY - 34 * s, x, groundY + 2 * s);
  noStroke();
  // deck
  fill("#c18f5a"); rect(0, groundY, width, height - groundY);
  fill("#dcab72"); rect(0, groundY, width, 16 * s);
  fill("#8f6238"); rect(0, groundY + 16 * s, width, 3 * s);
  // plank gaps scroll with the road
  stroke("#8f6238"); strokeWeight(3 * s);
  const plank = 70 * s;
  for (let x = -mod(t * 1.0, plank) - plank; x < width + plank; x += plank)
    line(x, groundY + 19 * s, x - 34 * s, height);
  line(0, groundY + (height - groundY) * 0.55, width, groundY + (height - groundY) * 0.55);
  noStroke();
}

function drawBoard() {
  fill("#0fa3b1");
  beginShape();
  vertex(-78, -2); vertex(-66, 8); vertex(66, 8); vertex(78, -2);
  vertex(76, 2); vertex(64, 13); vertex(-64, 13); vertex(-76, 2);
  endShape(CLOSE);
  fill("#ff7f50"); rect(-62, 5, 124, 4, 2);
  fill("#9aa5b1"); rect(-50, 13, 10, 6); rect(40, 13, 10, 6);
  for (const wx of [-45, 45]) {
    push(); translate(wx, 26);
    fill("#fff8e7"); stroke("#264653"); strokeWeight(2); circle(0, 0, 22);
    rotate(t * 0.12);
    line(-8, 0, 8, 0); line(0, -8, 0, 8);
    pop(); noStroke();
  }
}

function drawCapybara() {
  const lean = radians(3) + (jumpY !== 0 ? radians(-3) : 0);
  push(); rotate(lean);
  // legs and feet
  fill("#7a4f2e");
  rect(-30, -14, 10, 16, 3); rect(-10, -14, 10, 16, 3); rect(16, -14, 10, 16, 3); rect(34, -14, 10, 16, 3);
  fill("#4a2f1a");
  ellipse(-25, 0, 16, 6); ellipse(-5, 0, 16, 6); ellipse(21, 0, 16, 6); ellipse(39, 0, 16, 6);
  // body
  fill("#a8774c"); ellipse(0, -34, 96, 56);
  fill("#c39466"); ellipse(2, -22, 72, 22);
  // head
  fill("#a8774c"); rect(24, -74, 56, 42, 16);
  fill("#b88556"); ellipse(68, -50, 34, 30);
  // ear
  fill("#8a5d3a"); ellipse(36, -76, 12, 14);
  // nose and mouth
  fill("#3b2a20"); ellipse(78, -55, 12, 10);
  noFill(); stroke("#3b2a20"); strokeWeight(2);
  arc(70, -42, 14, 8, 0.1, PI - 0.3);
  noStroke();
  // sunglasses
  fill("#111"); rect(46, -68, 24, 11, 4); rect(32, -66, 16, 3, 1);
  fill(255, 255, 255, 140); rect(50, -66, 6, 3, 1);
  // tiny hot pink cowboy hat
  fill("#ff1493");
  ellipse(52, -75, 32, 7);
  rect(43, -88, 18, 14, 5, 5, 1, 1);
  fill("#c2185b"); rect(43, -81, 18, 3);
  pop();
}

// 0 = bright day, 1 = deep dusk (cycles every ~30 seconds)
function dusk() { return (1 - cos(t * 0.0008)) / 2; }

function burst(x, y, n, cols, sp) {
  for (let i = 0; i < n; i++) {
    const a = random(TWO_PI), v = random(1, sp);
    parts.push({ x, y, vx: cos(a) * v, vy: sin(a) * v - 1, life: random(25, 45), max: 45, c: random(cols), r: random(2, 5) });
  }
}

function updateParts() {
  push(); noStroke();
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life--;
    if (p.life <= 0) { parts.splice(i, 1); continue; }
    drawingContext.globalAlpha = p.life / p.max;
    fill(p.c); circle(p.x, p.y, p.r * 2);
  }
  drawingContext.globalAlpha = 1;
  pop();
}
