/*this file contains basic triangulation implementation
*/
//this function returns list of triangles, as structures loaded from pdb,
//each element of list contains 3 vertices
function get_triangles(chain1, chain2) {
  return [];
}

Triangulation = function(chain1, chain2) {
  var result = new THREE.Object3D();
  var geom = new THREE.Geometry();
  var triangles = get_triangles(chain1, chain2);
  for (var i = 0; i < triangles.length; i ++) {
    var triangle = new THREE.Geometry();
    for (var j = 0; j < 3; j++)
      triangle.vertices.push(triangles[i][j].asVector3());
    triangle.vertices.push(triangles[i][0].asVector3());
    geom.merge(triangle);
  }
  //var point1, point2, point3;
  //for (residue in chain1) {
    //for (var i = 0; i < 2/*chain1[residue].length*/; i++) {
  //    point1 = chain1[residue][0].asVector3();
  //    point2 = chain1[residue][1].asVector3();
  //    break;
    //}
  //}
  //for (residue in chain2) {
  //  point3 = chain2[residue][0].asVector3();
  //  break;
  //}

  //geom.vertices.push(point1);
  //geom.vertices.push(point2);
  //geom.vertices.push(point3);
  //geom.vertices.push(point1);

  var material = new THREE.LineBasicMaterial({ color: 0xffffff });
  result.add(new THREE.Line(geom, material));
  return result;

}
