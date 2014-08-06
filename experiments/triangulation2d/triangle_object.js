var paired_hash = {};

function det2(arr) {
  return arr[0][0]*arr[1][1] - arr[0][1]*arr[1][0];
}

function det3(arr) {
  return arr[0][0]*det2([
    [arr[1][1], arr[1][2]],
    [arr[2][1], arr[2][2]]
    ]) -
    arr[1][1]*det2([
      [arr[0][0], arr[0][2]],
      [arr[2][0], arr[2][2]]
      ]) +
    arr[2][2]*det2([
      [arr[0][0], arr[0][1]],
      [arr[1][0], arr[1][1]]
      ]);
}

function det4(arr) {
//  console.log([arr[0]].concat(arr.slice(2, 4)));
  return arr[0][3] * det3(arr.slice(1, 4))
       - arr[1][3] * det3([arr[0]].concat(arr.slice(2, 4)))
       + arr[2][3] * det3(arr.slice(0, 2).concat([arr[3]]))
       - arr[3][3] * det3(arr.slice(0, 3))
  ;
}



function get_cc_order(p1, p2, p3) {
  if (p3.sub(p1).dot(p2.sub(p1).ortho()) < 0) {
    return [p1, p2, p3];
  }
  return [p1, p3, p2];
}

function get_coefficients(p) {
  //console.log("a");
  a = det3([
      [p[0].x, p[0].y, 1],
      [p[1].x, p[1].y, 1],
      [p[2].x, p[2].y, 1],
    ]);
  //console.log("b", p[1].rad2(), p[1].x, p[1].y);
  b = det3([
      [p[0].rad2(), p[0].y, 1],
      [p[1].rad2(), p[1].y, 1],
      [p[2].rad2(), p[2].y, 1],
    ]);
  c = det3([
      [p[0].rad2(), p[0].x, 1],
      [p[1].rad2(), p[1].x, 1],
      [p[2].rad2(), p[2].x, 1],
    ]);
  d = det3([
      [p[0].rad2(), p[0].x, p[0].y],
      [p[1].rad2(), p[1].x, p[1].y],
      [p[2].rad2(), p[2].x, p[2].y],
    ]);
  return [a, b, c, d];
}

//FIX: add counter clockwise ordering for points in triangle
TriangleObject = function(p1, p2, p3) {
  this.p = get_cc_order(p1, p2, p3);
  this.coeffs = get_coefficients(this.p);

  this.get_p = function() {
    return this.p;
  }

  this.equals = function(triangle) {
    return this.p[0].equals(triangle.p[0])
            && this.p[1].equals(triangle.p[1])
            && this.p[2].equals(triangle.p[2]);
  }

  this.is_near = function(p) {
    return this.coeffs[0]*p.rad2() - this.coeffs[1]*p.x + this.coeffs[2]*p.y - this.coeffs[3] < 0;
  }

  this.except = function(point) {
    if (this.p[0].equals(point))
      return this.p.slice(1, 3);
    if (this.p[1].equals(point))
      return [this.p[0], this.p[2]];
    if (this.p[2].equals(point))
      return [this.p[0], this.p[1]];
  }

  this.add_to = function(hsh) {
    if (hsh[this.p[0]] == null) {
      hsh[this.p[0]] = {};
    }
    if (hsh[this.p[1]] == null) {
      hsh[this.p[1]] = {};
    }
    if (hsh[this.p[2]] == null) {
      hsh[this.p[2]] = {};
    }
    if (paired_hash[this.p[0]] == null) {
      paired_hash[this.p[0]] = {};
    }
    if (paired_hash[this.p[1]] == null) {
      paired_hash[this.p[1]] = {};
    }
    if (paired_hash[this.p[2]] == null) {
      paired_hash[this.p[2]] = {};
    }
    if (paired_hash[this.p[0]][this.p[1]] == null)
      paired_hash[this.p[0]][this.p[1]] = {};
    if (paired_hash[this.p[0]][this.p[2]] == null)
      paired_hash[this.p[0]][this.p[2]] = {};
    if (paired_hash[this.p[1]][this.p[0]] == null)
      paired_hash[this.p[1]][this.p[0]] = {};
    if (paired_hash[this.p[1]][this.p[2]] == null)
      paired_hash[this.p[1]][this.p[2]] = {};
    if (paired_hash[this.p[2]][this.p[0]] == null)
      paired_hash[this.p[2]][this.p[0]] = {};
    if (paired_hash[this.p[2]][this.p[1]] == null)
      paired_hash[this.p[2]][this.p[1]] = {};

    hsh[this.p[0]][this] = this;
    hsh[this.p[1]][this] = this;
    hsh[this.p[2]][this] = this;
    paired_hash[this.p[0]][this.p[1]][this] = this;
    paired_hash[this.p[0]][this.p[2]][this] = this;
    paired_hash[this.p[1]][this.p[0]][this] = this;
    paired_hash[this.p[1]][this.p[2]][this] = this;
    paired_hash[this.p[2]][this.p[0]][this] = this;
    paired_hash[this.p[2]][this.p[1]][this] = this;
  }

  this.remove_from = function(hsh) {
    if (hsh[this.p[0]] != null) {
      delete hsh[this.p[0]][this];
    }
    if (hsh[this.p[1]] != null) {
      delete hsh[this.p[1]][this];
    }
    if (hsh[this.p[2]] != null) {
      delete hsh[this.p[2]][this];
    }
    //paired hash
    if (paired_hash[this.p[0]] != null) {
      if (paired_hash[this.p[0]][this.p[1]] != null)
        delete paired_hash[this.p[0]][this.p[1]][this];
      if (paired_hash[this.p[0]][this.p[2]] != null)
        delete paired_hash[this.p[0]][this.p[2]][this];
    }
    if (paired_hash[this.p[1]] != null) {
      if (paired_hash[this.p[1]][this.p[0]] != null)
        delete paired_hash[this.p[2]][this.p[0]][this];
      if (paired_hash[this.p[1]][this.p[2]] != null)
        delete paired_hash[this.p[1]][this.p[2]][this];
    }
    if (paired_hash[this.p[2]] != null) {
      if (paired_hash[this.p[2]][this.p[0]] != null)
        delete paired_hash[this.p[2]][this.p[0]][this];
      if (paired_hash[this.p[2]][this.p[1]] != null)
        delete paired_hash[this.p[2]][this.p[1]][this];
    }
  }

  this.get_3rd = function(p1, p2) {
    if (this.p[0].equals(p1)) {
      if (this.p[1].equals(p2))
        return this.p[2];
      if (this.p[2].equals(p2))
        return this.p[1];
    }
    if (this.p[1].equals(p1)) {
      if (this.p[0].equals(p2))
        return this.p[2];
      if (this.p[2].equals(p2))
        return this.p[0];
    }
    if (this.p[2].equals(p1)) {
      if (this.p[0].equals(p2))
        return this.p[1];
      if (this.p[2].equals(p2))
        return this.p[0];
    }
    return null;
  }

  this.has_point = function(point) {
    return (this.p[0].equals(point) || this.p[1].equals(point) || this.p[2].equals(point));
  }

  this.toString = function() {return "TriangleObject: { p: " + this.p.join(",") + "}"; }
}


function det(triangle, point) {
  console.log("computing det4:");
  //console.log([ point.rad2(), point.x, point.y, 1].join(", "));
  //for (var i = 0; i < 3; i++)
  //  console.log([ triangle.p[i].rad2(), triangle.p[i].x, triangle.p[i].y, 1].join(", "));
  //  console.log("end of printing det");
  return det4([
      [ point.rad2(), point.x, point.y, 1],
      [ triangle.p[0].rad2(), triangle.p[0].x, triangle.p[0].y, 1],
      [ triangle.p[1].rad2(), triangle.p[1].x, triangle.p[1].y, 1],
      [ triangle.p[2].rad2(), triangle.p[2].x, triangle.p[2].y, 1]
    ]);
}
