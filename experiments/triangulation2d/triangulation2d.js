/*this file contains basic triangulation implementation
*/
//this function returns list of triangles, as structures loaded from pdb,
//each element of list contains 3 vertices


function get_area(points) {
  var a = points[1].sub(points[0]).length();
  var b = points[2].sub(points[0]).length();
  var c = points[1].sub(points[2]).length();
  return Math.sqrt((a + b + c)*(a + b - c) * (a + c - b) * (b + c - a)) / 4.0;
}
function get_area2(v1, v2) {
  return Math.sqrt(v1.dot(v1)*v2.dot(v2) - v1.dot(v2)*v1.dot(v2));
}

//for given set of 3 points, method returns
//radius and coordinates of circle
function get_circle_info(points) {
  console.log(points);
  area = get_area(points);
  console.log("computed area: " + area);
  get_alpha = function(ra, rb, rc, area) {
    var v1 = ra.sub(rc);
    var a = rb.sub(rc).length();
    var v2 = ra.sub(rb);
    return a*a/(8*area*area)*(v1.dot(v2));
  }
  var aa = points[0].sub(points[1]).length();
  var bb = points[1].sub(points[2]).length();
  var cc = points[2].sub(points[0]).length();
  console.log("sides lengths: "+ [aa,bb,cc].join(", "));
  var a1 = points[0].multiplyScalar(get_alpha(points[0], points[1], points[2], area));
  var a2 = points[1].multiplyScalar(get_alpha(points[1], points[0], points[2], area));
  var a3 = points[2].multiplyScalar(get_alpha(points[2], points[0], points[1], area));
  return [a1.add(a2).add(a3), aa*bb*cc/(4*area)];
}

Triangle = function(points) {
  return [[points[0], points[1]], [points[1], points[2]], [points[2], points[0]]];
}

EPS = 0.0001;

function get_orthogonal(p) {
  //TODO: in case when p1.y == p1.x == 0, add some additional checks
  return [new Vector(p.y, -p.x)];
}
//reimplementation for 2 lines segments intersection
function segments_intersection(p1, p2, p3, p4) {
  var r1 = p2.sub(p1);
  var r2 = p4.sub(p3);

  var ortho_pair = get_orthogonal(r2);
  if (ortho_pair.length == 2) {
    //check for results of multiplication for both vectors and if they are equal to zero -
    // it means that lines are parallel or the same
    if (Math.abs(r1.multiplyScalar(ortho_pair[0])) < EPS && Math.abs(r1.multiplyScalar(ortho_pair[1])) < EPS) {
      console.log("points lie in parallel lines or on the same");
      return false;
    }
    var k1 = p3.sub(p1).multiplyScalar(ortho_pair[0])/r1.multiplyScalar(ortho_pair[0]);
    var k2 = p3.sub(p1).multiplyScalar(ortho_pair[1])/r1.multiplyScalar(ortho_pair[1]);
    if (Math.abs(k1 - k2) < EPS)
      return true;
  }
  return false;
  //else do some additional checks

}

function intersects(p1, p2, p3, p4) {
  return segments_intersection(p1,p2,p3,p4);
  //console.log("in intersects method");
  var v1 = p2.sub(p1);
  var v2 = p4.sub(p1);
  var v3 = p3.sub(p1);
  var v4 = p4.sub(p2);
  var v5 = p3.sub(p2);
  //console.log(v1, v2, v3);
  var r1 = 1;
  //console.log(get_area2(v1, v2), get_area2(v1, v3), get_area2(v2,v3), get_area2(v4, v5));
  if (Math.abs(get_area2(v1, v2) + get_area2(v1, v3) - get_area2(v2,v3) - get_area2(v4, v5)) < EPS)
    r1 = -1;
  v1 = p4.sub(p3);
  v2 = p2.sub(p3);
  v3 = p1.sub(p3);
  v4 = p2.sub(p4);
  v5 = p1.sub(p4);
  //console.log(v1, v2, v3);
  //console.log(get_area2(v1, v2), get_area2(v1, v3), get_area2(v2,v3), get_area2(v4, v5));

  var r2 = 1;
  if (Math.abs(get_area2(v1, v2) + get_area2(v1, v3) - get_area2(v2,v3) - get_area2(v4, v5)) < EPS)
    r2 = -1;
  //  console.log("exiting from intersect");
  return (r1 < 0 && r2 < 0);
}


TriangleSet = function(points, target) {
  console.log(target);
  var results = [[points[0], target], [points[1], target], [points[2], target]];
  if (!intersects(points[0], target, points[1], points[2])) {
    console.log("part 1");
    results.push([points[1], points[2]]);
  }
  if (!intersects(points[1], target, points[0], points[2])) {
    console.log("part 2");
    results.push([points[0], points[2]]);
  }
  if (!intersects(points[2], target, points[1], points[0])) {
    console.log("part 3");
    results.push([points[1], points[0]]);
  }
  return results;
}

//helper method, selects 2 points closest from target
function select_closest2(points, target) {
  console.log(target);
  //return [];
  if (points[0].sub(target).length() > points[1].sub(target).length() &&
      points[0].sub(target).length() > points[2].sub(target).length()) {
        console.log("case 1");
        return Triangle([points[1], points[2], target]);
  }
  if (points[1].sub(target).length() > points[0].sub(target).length() &&
      points[1].sub(target).length() > points[2].sub(target).length()) {
        console.log("case 1");
        return Triangle([points[0], points[2], target]);
  }
  if (points[2].sub(target).length() > points[1].sub(target).length() &&
      points[2].sub(target).length() > points[0].sub(target).length()) {
        console.log("case 1");
        return Triangle([points[1], points[0], target]);
  }



}

TriangleObject = function(p1, p2, p3) {
  this.p = [p1, p2, p3];
  this.equals = function(triangle) {
    return this.p[0].equals(triangle.p[0])
            && this.p[1].equals(triangle.p[1])
            && this.p[2].equals(triangle.p[2]);
  }

  this.get_3rd = function(p1, p2) {
    if (p[0].equals(p1)) {
      if (p[1].equals(p2))
        return p[2];
      return p[1];
    }
    if (p[1].equals(p1)) {
      if (p[0].equals(p2))
        return p[2];
      return p[0];
    }
    if (p[0].equals(p2))
      return p[1];
    return p[0];
  }

  this.has_point = function(point) {
    return (p[0].equals(point) || p[1].equals(point) || p[2].equals(point));
  }
}

var triangles_set;
var result;

function buildTriangle(hsh, p1, p2, p3) {
  if (hsh[p1] == null) { hsh[p1] = {}; }
  if (hsh[p2] == null) { hsh[p2] = {}; }
  if (hsh[p3] == null) { hsh[p3] = {}; }

  triangle = new TriangleObject(p1, p2, p3);
  triangles_set.push(triangle);
  hsh[p1][triangle] = 1;
  hsh[p2][triangle] = 1;
  hsh[p3][triangle] = 1;
}

function det2(arr) {
  return arr[0][0]*arr[1][1] - arr[0][1]*arr[1][0];
}

function det3(arr) {
  console.log(arr.length, arr[0].length);

  return arr[0][0]*det2([
    [arr[1][1], arr[1, 2]],
    [arr[2][1], arr[2, 2]]
    ]) -
    arr[1][1]*det2([
      [arr[0, 0], arr[0, 2]],
      [arr[2, 0], arr[2, 2]]
      ]) +
    arr[2][2]*det2([
      [arr[0, 0], arr[0, 1]],
      [arr[1, 0], arr[1, 1]]
      ]);
}

function det4(arr) {
  console.log(arr.length, arr[0].length);
  console.log(arr.slice(1,4));
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
function lies_near(triangle, point) {
  if (point.equals(triangle.p[0]) || point.equals(triangle.p[1]) || point.equals(triangle.p[2]))
    return false;
  return (det(triangle, point) < 0);
}

function find_triangle_by2_except3(r, v1, v2, v3, point) {
  for (var tr in result[v1]) {
    if (tr.has_point(v2) && r[tr] == null && !tr.has_point(v3) && lies_near(tr, point)) {
      r[tr] = 1;
      var p3 = tr.get_3rd(v1, v2);
      find_triangle_by2_except3(r, v1, p3, v2, point);
      find_triangle_by2_except3(r, v2, p3, v1, point);
    }
  }

  for (var tr in result[v2]) {
    if (tr.has_point(v1) && r[tr] == null  && !tr.has_point(v3) && lies_near(tr, point)) {
      r[tr] = 1;
      var p3 = tr.get_3rd(v1, v2);
      find_triangle_by2_except3(r, v1, p3, v2, point);
      find_triangle_by2_except3(r, v2, p3, v1, point);
    }
  }
}

function lies_inside(result_hash, point) {
  var nearest = false;
  for (var i = 0; i < triangles_set.length; i++) {
    if (lies_near(triangles_set[i], point)) {
       nearest.push(triangles_set[i]);
       break;
    }
  }
  if (nearest) {
    //fixme: add recursive point search instead
    start_triangle = nearest[0];
    var r = {};
    find_triangle_by2_except3(r, start_triangle.p[0], start_triangle.p[1], start_triangle.p[2], point);
    find_triangle_by2_except3(r, start_triangle.p[1], start_triangle.p[2], start_triangle.p[0], point);
    find_triangle_by2_except3(r, start_triangle.p[2], start_triangle.p[0], start_triangle.p[1], point);
    for (var v in r)
      nearest.push(v);

  }
  //travel to nearest triangles and get all triangles to rebuild
  return nearest;
}

function rebuildTriangles(result, nearest_triangles, point) {
  //todo
}

//method somehow adds new point to triangulation
function addPoint(hsh, point) {

}

function get_triangles(points) {
  result = {};
  triangles_set = [];
  if (points.length <= 2) {
    console.log("not enough points to build triangulation");
    return [];
  }
  buildTriangle(result, points[0], points[1], points[2]);
  for (var i = 3; i < points.length; i++) {
      nearest_triangles = lies_inside(result, points[i]);
      if (!nearest_triangles) {
        rebuildTriangles(result, nearest_triangles, points[i]);
      }
    else {
      addPoint(result, points[i]);
    }
  }

  /*if (points.length == 3) {
    return Triangle(points);
  }
  if (points.length == 4) {
    var res = get_circle_info(points.slice(0, 3));
    console.log(res);
    if (res[0].sub(points[3]).length() > res[1]) {
      var result = Triangle(points.slice(0, 3)).concat(
        select_closest2(points.slice(0, 3), points[3])
        );
        console.log("returns 2 triangles");
      return result;
    } else {
      console.log("returning Triangle set");
      // connect 4th point with all other points and all lines that do not intersect these lines
      return TriangleSet(points.slice(0, 3), points[3]);
    }
  }*/
  //not impl.
  return [];

}

Triangulation = function(points) {
  var result = new THREE.Object3D();
  var geom = new THREE.Geometry();
  var triangles = get_triangles(points);
  for (var vertex in triangles) {
      for (var i = 0; i< triangles[vertex].length; i++) {
          var line = new THREE.Geometry();
          line.vertices.push(vertex.asVector3());
          line.vertices.push(triangles[vertex][i].asVector3());
          geom.merge(triangle);
      }
  }

  var material = new THREE.LineBasicMaterial({ color: 0xffffff });
  result.add(new THREE.Line(geom, material));
  return result;
}
