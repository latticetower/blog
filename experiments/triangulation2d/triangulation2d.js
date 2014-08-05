/*this file contains basic triangulation implementation
*/
//this function returns list of triangles, as structures loaded from pdb,
//each element of list contains 3 vertices

function get_cc_order(p1, p2, p3) {
  if (p3.sub(p1).dot(p2.sub(p1).ortho()) < 0) {
    return [p1, p2, p3];
  }
  return [p1, p3, p2];
}

//FIX: add counter clockwise ordering for points in triangle
TriangleObject = function(p1, p2, p3) {
  this["p"] = get_cc_order(p1, p2, p3);

  this.get_p = function() {
    return this.p;
  }

  this.equals = function(triangle) {
    return this.p[0].equals(triangle.p[0])
            && this.p[1].equals(triangle.p[1])
            && this.p[2].equals(triangle.p[2]);
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
    hsh[this.p[0]][this] = this;
    hsh[this.p[1]][this] = this;
    hsh[this.p[2]][this] = this;
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


function buildTriangle(hsh, p1, p2, p3) {
  if (hsh[p1] == null) { hsh[p1] = {}; }
  if (hsh[p2] == null) { hsh[p2] = {}; }
  if (hsh[p3] == null) { hsh[p3] = {}; }
  triangle = new TriangleObject(p1, p2, p3);
  triangles_set.push(triangle);
  hsh[p1][triangle] = triangle;
  hsh[p2][triangle] = triangle;
  hsh[p3][triangle] = triangle;
}

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
  return arr[0][3] * det3(arr.slice(1, 4))
       - arr[1][3] * det3([arr[0]].concat(arr.slice(2, 4)))
       + arr[2][3] * det3(arr.slice(0, 2).concat([arr[3]]))
       - arr[3][3] * det3(arr.slice(0, 3))
  ;
}

function det(triangle, point) {
  return det4([
      [ point.rad2(), point.x, point.y, 1],
      [ triangle.p[0].rad2(), triangle.p[0].x, triangle.p[0].y, 1],
      [ triangle.p[1].rad2(), triangle.p[1].x, triangle.p[1].y, 1],
      [ triangle.p[2].rad2(), triangle.p[2].x, triangle.p[2].y, 1]
    ]);
}
function lays_near(triangle, point) {
  if (point == null)
    return false;
  if (point.equals(triangle.p[0]) || point.equals(triangle.p[1]) || point.equals(triangle.p[2]))
    return false;
  return (det(triangle, point) < 0);
}

//method finds all triangles by 2 points except point v3
// and saves them to r hash
function find_triangle_by2_except3(result_hash, r, v1, v2, v3, point) {

  for (var t in result_hash[v1]) {
    var tr = result_hash[v1][t];
    if (tr.has_point(v2) && r[tr] == null && !tr.has_point(v3) && lays_near(tr, point)) {
      r[tr] = tr;
      var p3 = tr.get_3rd(v1, v2);
      find_triangle_by2_except3(result_hash, r, v1, p3, v2, point);
      find_triangle_by2_except3(result_hash, r, v2, p3, v1, point);
    }
  }

  for (var t in result_hash[v2]) {
    var tr = result_hash[v2][t];
    if (tr.has_point(v1) && r[tr] == null  && !tr.has_point(v3) && lays_near(tr, point)) {
      r[tr] = tr;
      var p3 = tr.get_3rd(v1, v2);
      find_triangle_by2_except3(result_hash, r, v1, p3, v2, point);
      find_triangle_by2_except3(result_hash, r, v2, p3, v1, point);
    }
  }
}

function lays_inside(result_hash, point) {
  var nearest = false;
  for (var i = 0; i < triangles_set.length; i++) {
    if (lays_near(triangles_set[i], point)) {
       nearest = [triangles_set[i]];
       break;
    }
  }
  if (nearest) {
    start_triangle = nearest[0];
    var r = {};
    find_triangle_by2_except3(result_hash, r, start_triangle.p[0], start_triangle.p[1], start_triangle.p[2], point);
    find_triangle_by2_except3(result_hash, r, start_triangle.p[1], start_triangle.p[2], start_triangle.p[0], point);
    find_triangle_by2_except3(result_hash, r, start_triangle.p[2], start_triangle.p[0], start_triangle.p[1], point);
    for (var v in r)
      nearest.push(r[v]);

  }
  //travel to nearest triangles and get all triangles to rebuild
  return nearest;
}

function rebuildTriangles(result, nearest_triangles, point) {
  for (var i = 0; i < nearest_triangles.length; i ++) {
    var tr = nearest_triangles[i];
    tr.remove_from(result);
    var index = triangles_set.indexOf(tr);
    triangles_set.splice(index, 1);

    //todo: fix if needed
    var t1 = new TriangleObject(tr.p[0], tr.p[1], point);
    if (det(t1, tr.p[2]) >= 0) {
      triangles_set.push(t1);
      t1.add_to(result);
    }
    var t2 = new TriangleObject(tr.p[1], tr.p[2], point);
    if (det(t2, tr.p[0]) >= 0) {
      triangles_set.push(t2);
      t2.add_to(result);
    }
    var t3 = new TriangleObject(tr.p[2], tr.p[0], point);
    if (det(t3, tr.p[1]) >= 0) {
      triangles_set.push(t3);
      t3.add_to(result);
    }
  }
}

function find_nearest_point(hsh, point) {
  var nearest_point = null;
  var min_distance = 0;
  for (var p in hsh) {
    if (nearest_point == null) {
      nearest_point = [points_hash[p]];
      min_distance = point.distance_to(points_hash[p]);
      continue;
    }
    if (point.distance_to(points_hash[p]) < min_distance) {
      nearest_point = [points_hash[p]];
      min_distance = point.distance_to(points_hash[p]);
    }
    if (point.distance_to(points_hash[p]) == min_distance) {
      nearest_point.push(points_hash[p]);
    }
  }
  return nearest_point;
}
//method somehow adds new point to triangulation
function addPoint(hsh, point) {
  //rough and ineffective implementation
  /*
  var points = find_nearest_point(hsh, point);
  if (points != null) {
    for (i in points) {
      var p = points[i];
      for (var t in hsh[p]) {

      }
    }
  }
  */
  //
  for (var i in hsh) {
      for (var j in hsh) {
          if (i == j)
              continue;
          var res = true;
          var tr = new TriangleObject(points_hash[i], points_hash[j], point);
          for (var t in hsh[i]) {
          //for (var k = 0; k < tr.p.length; k ++) {
              var triangle = hsh[i][t];
              var p = triangle.get_3rd(points_hash[i], points_hash[j]);
              if (p != null && !p.equals(point) && lays_near(tr, p))
                  res = false;
          }
          //}
          if (res) {
              tr.add_to(hsh);
              triangles_set.push(tr);
          }
      }
  }

}

function get_triangles(points) {
  result = {};
  triangles_set = [];
  if (points.length <= 2) {
    return [];
  }
  buildTriangle(result, points[0], points[1], points[2]);
  for (var i = 3; i < points.length; i++) {
      nearest_triangles = lays_inside(result, points[i]);

      if (nearest_triangles) {
        console.log("rebuild is called");
        rebuildTriangles(result, nearest_triangles, points[i]);
      }
      else {
        console.log("point addition handling");
        addPoint(result, points[i]);
      }

  }
  console.log(lays_near(new TriangleObject(new Vector(0,0), new Vector(0, 20), new Vector(20, 0)), new Vector(30, 20)));
  return result;

}

Triangulation = function(points) {
  var triangulation_result = new THREE.Object3D();
  var geom = new THREE.Geometry();
  var triangles = get_triangles(points);

  for (var i in result) {
    for (var j in result[i]) {
      var triangle = result[i][j];
      var line = new THREE.Geometry();
      for (var j = 0; j < triangle.p.length; j ++) {
          line.vertices.push(triangle.p[j].asVector3());
      }
      line.vertices.push(triangle.p[0].asVector3());
      geom.merge(line);
    }
  }

  var material = new THREE.LineBasicMaterial({ color: 0xff0000 });
  triangulation_result.add(new THREE.Line(geom, material));
  return triangulation_result;
}
