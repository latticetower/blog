/*this file contains basic triangulation implementation
*/
//this function returns list of triangles, as structures loaded from pdb,
//each element of list contains 3 vertices


function buildTriangle(hsh, p1, p2, p3) {
  triangle = new TriangleObject(p1, p2, p3);
  triangles_set[triangle] = triangle;
  triangle.add_to(hsh);

}


function lays_near(triangle, point) {
  if (point == null)
    return false;
  if (point.equals(triangle.p[0]) || point.equals(triangle.p[1]) || point.equals(triangle.p[2]))
    return false;
  return triangle.is_near(point);
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
  for (var i in triangles_set) {
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
    delete triangles_set[tr];

    //todo: fix if needed
    var t1 = new TriangleObject(tr.p[0], tr.p[1], point);
    if (det(t1, tr.p[2]) >= 0) {
      triangles_set[t1] = t1;
      t1.add_to(result);
    }
    var t2 = new TriangleObject(tr.p[1], tr.p[2], point);
    if (det(t2, tr.p[0]) >= 0) {
      triangles_set[t2] = t2;
      t2.add_to(result);
    }
    var t3 = new TriangleObject(tr.p[2], tr.p[0], point);
    if (det(t3, tr.p[1]) >= 0) {
      triangles_set[t3] = t3;
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


function is_divider(v1, v2, p1, p2) {
  return (p1.sub(v1).dot(v2.sub(v1).ortho()) * p2.sub(v1).dot(v2.sub(v1).ortho()) < 0) ;
}

//helper method: returns true if new_triangle is valid for all points which can be riched from given point via incidence relationship
function is_valid(hsh, new_triangle, point) {
  if (hsh[point] == null)
    return true;
  for (var triangle in hsh[point]) {
    if (hsh[point][triangle].equals(new_triangle))
      continue;
    var p = hsh[point][triangle].except(point);
    for (var i = 0; i < p.length; i ++) {
      if (lays_near(new_triangle, p[i]))
        return false;
    }
  }
  return true;
}

function addPoint_inner_cycle(i, j, test_triangle,
                               new_triangles, old_triangles,
                               hsh, point
                             ) {
  var tr = paired_hash[i][j][test_triangle];
  var p3_ = tr.get_3rd(points_hash[i], points_hash[j]);

  var t1 = new TriangleObject(points_hash[i], points_hash[j], point);

  if (!lays_near(t1, p3_)) {
    if (is_valid(hsh, t1, points_hash[i]) && is_valid(hsh, t1, points_hash[j]) &&
            is_valid(hsh, t1, p3_)) {
      if (!is_divider(points_hash[i], points_hash[j], point, p3_))
        old_triangles[tr] = tr;
      new_triangles[t1] = t1;

    }

  }
}

//method somehow adds new point to triangulation
function addPoint(hsh, point) {
  //rough and ineffective implementation
  //
  var new_triangles = {};
  var old_triangles = {};
  for (var i in hsh) {
      for (var j in hsh) {
          if (i == j)
              continue;
          for (var test_triangle in paired_hash[i][j]) {
            addPoint_inner_cycle(i, j, test_triangle, new_triangles, old_triangles, hsh, point);
          }
      }
  }

  for (var i in old_triangles) {
    old_triangles[i].remove_from(hsh);
    delete triangles_set[old_triangles[i]];
  }
  //console.log("new triangles found ", new_triangles.length);

  for (var i in new_triangles) {
    new_triangles[i].add_to(hsh);
    triangles_set[new_triangles[i]] = new_triangles[i];
  }

}

function get_triangles(points) {
  result = {};
  triangles_set = {};
  if (points.length <= 2) {
    return [];
  }
  buildTriangle(result, points[0], points[1], points[2]);
  for (var i = 3; i < points.length; i++) {
      nearest_triangles = lays_inside(result, points[i]);

      if (nearest_triangles) {
        console.log("rebuild is called", points[i].toString());
        rebuildTriangles(result, nearest_triangles, points[i]);
      }
      else {
        console.log("point addition handling");
        addPoint(result, points[i]);
      }
  }
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
