/*this file contains basic triangulation implementation
*/
//this function returns list of triangles, as structures loaded from pdb,
//each element of list contains 3 vertices
function get_triangles(chain1, chain2) {
  return get_triangles2(chain1.slice(0, 2).concat(chain2.slice(0, 2)));
  //return [];
}


function get_area(points) {

  var v1 = points[1].sub(points[0]);
  var v2 = points[2].sub(points[0]);
  console.log(v1["x"]);
  return (v1.dot(v2) + v2.dot(v1)) / 2.0;
}

//for given set of 3 points, method returns
//radius and coordinates of circle
function get_circle_info(points) {
  area = get_area(points);
  console.log("computed area: " + area);
  get_alpha = function(ra, rb, rc, area) {
    var v1 = rb.sub(rc);
    var a = v1.length();
    var v2 = ra.sub(rb);
    return a*a/(8*area*area)*(v1.dot(v2));
  }
  var aa = points[0].sub(points[1]).length();
  var bb = points[1].sub(points[2]).length();
  var cc = points[2].sub(points[0]).length();
  console.log("sides lengths: "+ [aa,bb,cc].join(", "));
  console.log(points[0]);
  var a1 = points[0].multiplyScalar(get_alpha(points[0], points[1], points[2], area));
  var a2 = points[1].multiplyScalar(get_alpha(points[1], points[2], points[0], area));
  var a3 = points[2].multiplyScalar(get_alpha(points[2], points[0], points[1], area));
  return [a1.add(a2).add(a3), aa*bb*cc/(4*area)];
}

Triangle = function(points) {
  return [[points[0], points[1]], [points[1], points[2]], [points[2], points[0]]];
}


function intersects(p1, p2, p3, p4) {
  var v1 = new Vector(0,0,0);
  var v2 = new Vector(0,0,0);
  var v3 = new Vector(0,0,0);
  v1.subVectors(p2, p1);
  v2.subVectors(p4, p1);
  v3.subVectors(p3, p1);
  var r1 = 1;
  if (v1.multiplyScalar(v2) * v1.multiplyScalar(v3) < 0)
    r1 = -1;
  v1.subVectors(p4, p3);
  v2.subVectors(p2, p3);
  v3.subVectors(p1, p3);
  var r2 = 1;
  if (v1.multiplyScalar(v2) * v1.multiplyScalar(v3) < 0)
    r2 = -1;
  return (r1 < 0 && r2 < 0);
}


TriangleSet = function(points, target) {
  var results = [[points[0], target], [points[1], target], [points[2], target]];
  if (!intersects(points[0], target, points[1], points[2])) {
    results.push([points[1], points[2]]);
  }
  if (!intersects(points[1], target, points[0], points[2])) {
    results.push([points[0], points[2]]);
  }
  if (!intersects(points[2], target, points[1], points[0])) {
    results.push([points[1], points[0]]);
  }
  return results;
}

//helper method, selects 2 points closest from target
function select_closest2(points, target) {
  if (points[0].sub(target).length() > points[1].sub(target).length()) {
    if (points[0].sub(target).length() > points[2].sub(target).length()) {
      return Triangle([points[1], points[2], target]);
    } else {
      return Triangle([points[0], points[1], target]);
    }
  } else {
    if (points[1].sub(target).length() < points[2].sub(target).length()) {
      return Triangle([points[0], points[1], target]);
    } else {
      return Triangle([points[0], points[2], target]);
    }
  }
}

function get_triangles2(points) {
  console.log("Length of points array is " + points.length);
  if (points.length == 3) {
    return [Triangle(points)];
  }
  if (points.length == 4) {
    console.log("in get triangles, points array size is 4");
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
  }
  //not impl.
  return [];

}

Triangulation = function(chain1, chain2) {
  var result = new THREE.Object3D();
  var geom = new THREE.Geometry();
  var triangles = get_triangles(chain1, chain2);
  console.log("having some lines ", triangles.length);
  console.log(triangles);
  for (var i = 0; i < triangles.length; i ++) {
    var triangle = new THREE.Geometry();
    triangle.vertices.push(triangles[i][0].asVector3());
    triangle.vertices.push(triangles[i][1].asVector3());
    geom.merge(triangle);
  }

  var material = new THREE.LineBasicMaterial({ color: 0xffffff });
  result.add(new THREE.Line(geom, material));
  return result;

}
