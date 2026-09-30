// ==========================================
// math3d.js — Library Helper Vektor & Matriks 4x4
// ==========================================

// Helper operasi vektor 3D
export const Vec3 = {
  // Pengurangan vektor: a - b
  subtract(a, b) {
    return [
      a[0] - b[0],
      a[1] - b[1],
      a[2] - b[2]
    ];
  },

  // Perkalian silang (cross product): a x b
  cross(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ];
  },

  // Normalisasi vektor ke panjang unit (magnitude = 1)
  normalize(v) {
    const length = Math.hypot(v[0], v[1], v[2]);

    if (length < 0.000001) {
      return [0, 0, 0];
    }

    return [
      v[0] / length,
      v[1] / length,
      v[2] / length
    ];
  },

  // Perkalian titik (dot product): a . b
  dot(a, b) {
    return (
      a[0] * b[0] +
      a[1] * b[1] +
      a[2] * b[2]
    );
  }
};

// Helper operasi matriks 4x4 (column-major)
export const Mat4 = {
  // Matriks identitas 4x4
  identity() {
    return new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  },

  // Matriks translasi 3D (tx, ty, tz)
  translation(tx, ty, tz) {
    return new Float32Array([
      1,  0,  0,  0,
      0,  1,  0,  0,
      0,  0,  1,  0,
      tx, ty, tz, 1
    ]);
  },

  // Matriks rotasi pada sumbu X (sudut dalam radian)
  rotationX(rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);

    return new Float32Array([
      1,  0, 0, 0,
      0,  c, s, 0,
      0, -s, c, 0,
      0,  0, 0, 1
    ]);
  },

  // Matriks rotasi pada sumbu Y (sudut dalam radian)
  rotationY(rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);

    return new Float32Array([
      c, 0, -s, 0,
      0, 1,  0, 0,
      s, 0,  c, 0,
      0, 0,  0, 1
    ]);
  },

  // Matriks penskalaan 3D (sx, sy, sz)
  scaling(sx, sy, sz) {
    return new Float32Array([
      sx, 0,  0,  0,
      0,  sy, 0,  0,
      0,  0,  sz, 0,
      0,  0,  0,  1
    ]);
  },

  // Perkalian dua matriks 4x4: a x b
  multiply(a, b) {
    const out = new Float32Array(16);

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        let sum = 0;

        for (let i = 0; i < 4; i++) {
          sum +=
            b[i * 4 + col] *
            a[row * 4 + i];
        }

        out[row * 4 + col] = sum;
      }
    }

    return out;
  },

  // Matriks kamera (Look-At / View Matrix) dari position, target, dan up
  lookAt(position, target, up) {
    const forward = Vec3.normalize(
      Vec3.subtract(target, position)
    );

    const right = Vec3.normalize(
      Vec3.cross(forward, up)
    );

    const correctedUp = Vec3.cross(right, forward);

    return new Float32Array([
      right[0], correctedUp[0], -forward[0], 0,
      right[1], correctedUp[1], -forward[1], 0,
      right[2], correctedUp[2], -forward[2], 0,

      -Vec3.dot(right, position),
      -Vec3.dot(correctedUp, position),
       Vec3.dot(forward, position),
      1
    ]);
  },

  // Matriks Proyeksi Perspektif (fovRad, aspect, near, far)
  perspective(fovRad, aspect, near, far) {
    const f = 1.0 / Math.tan(fovRad / 2);
    const rangeInv = 1.0 / (near - far);

    return new Float32Array([
      f / aspect, 0, 0,                         0,
      0,          f, 0,                         0,
      0,          0, (near + far) * rangeInv,  -1,
      0,          0, 2 * near * far * rangeInv, 0
    ]);
  },

  // Matriks Proyeksi Ortografis (left, right, bottom, top, near, far)
  orthographic(left, right, bottom, top, near, far) {
    return new Float32Array([
      2 / (right - left), 0, 0, 0,
      0, 2 / (top - bottom), 0, 0,
      0, 0, -2 / (far - near), 0,

      -(right + left) / (right - left),
      -(top + bottom) / (top - bottom),
      -(far + near) / (far - near),
      1
    ]);
  }
};
