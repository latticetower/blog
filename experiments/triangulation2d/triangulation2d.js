/*this file contains basic triangulation implementation
*/
//this function returns list of triangles, as structures loaded from pdb,
//each element of list contains 3 vertices


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


function lays_near(triangle, point) {
  if (point == null)
    return false;
  if (point.equals(triangle.p[0]) || point.equals(triangle.p[1]) || point.equals(triangle.p[2]))
    return false;
  //console.log("in lays_near", triangle.toString(), point.toString());

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


function is_divider(v1, v2, p1, p2) {
  return (p1.sub(v1).dot(v2.sub(v1).ortho()) * p2.sub(v1).dot(v2.sub(v1).ortho()) < 0) ;
}

//method somehow adds new point to triangulation
function addPoint(hsh, point) {
  //rough and ineffective implementation
  //
  for (var i in hsh) {
      for (var j in hsh) {
          if (i == j)
              continue;
          var res = true;
          //console.log(points_hash[i], points_hash[j], point);
          var tr = new TriangleObject(points_hash[i], points_hash[j], point);
          /*
           for (var t in hsh[i]) {
             var triangle = hsh[i][t];
             var p = triangle.get_3rd(points_hash[i], points_hash[j]);
             if (p!= null && !p.equals(point) && lays_near(tr, p))
               res = false;
           }*/
          var tr_changed = hsh[i][j];
          for (var t in hsh[i]) {
          //for (var k = 0; k < tr.p.length; k ++) {
              var triangle = hsh[i][t];
              var ps = triangle.except(points_hash[i]);
              for (var k = 0; k < ps.length; k++) {
                  var p = ps[k];
                  if (p != null && !p.equals(point) && lays_near(tr, p))
                      res = false;
              }
          }
          for (var t in hsh[j]) {
              var triangle = hsh[j][t];
              var ps = triangle.except(points_hash[j]);
              for (var k = 0; k < ps.length; k++) {
                  var p = ps[k];
                  if (p != null && !p.equals(point) && lays_near(tr, p))
                      res = false;
              }
          }
          //}
          if (res) {
              for (var t in hsh[i]) {
                var triangle = hsh[i][t];
                var p = triangle.get_3rd(points_hash[i], points_hash[j]);
                if (p != null && !p.equals(point) && !is_divider(points_hash[i], points_hash[j], p, point)) {
                  triangle.remove_from(hsh);
                }
              }
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
  console.log("test", lays_near(new TriangleObject
      (new Vector(0, 0), new Vector(0, 20), new Vector(20, 0)),
       new Vector(30, 0)
     ));
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
