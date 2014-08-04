var vectorized_points = [];

function drawPoints(points) {
  var result = new THREE.Object3D();
  var geometry = new THREE.Geometry();
  var material = new THREE.PointCloudMaterial({size:5.0});//{ color: 0xffffff, sizeAttenuation: false });

  for (var i = 0; i < points.length; i ++) {
    var vertex = new Vector(points[i]);
    vectorized_points.push(vertex);
    geometry.vertices.push(vertex.asVector3());
    //geometry.colors.push(new THREE.Color(1, 0, 0));

  }
  result.add(new THREE.PointCloud(geometry, material));
  return result;
}

function drawTriangulation() {
  return Triangulation(atomInfo['L'], atomInfo['H']);
}

var container, stats;

var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var scene, camera, renderer, light;
var geometries;
var atoms;


function init() {
    container = document.getElementById('container');
    console.log("init called");
    scene = new THREE.Scene();
    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 0, 1 );
    scene.add( light );
    camera = new THREE.PerspectiveCamera( 20, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 300;
    //camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    //camera.position.z = 1800;
    geometries = drawPoints(points_dataset);
    console.log(geometries);
    scene.add(geometries);
    scene.add(camera);

    renderer = new THREE.CanvasRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    container.appendChild( renderer.domElement );

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild( stats.domElement );

    //geometries.addEventListener( 'mousemove', onDocumentMouseMove, false );;
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove( event ) {
    mouseX = ( event.clientX - windowHalfX );
    mouseY = ( event.clientY - windowHalfY );
    console.log("mouse moved " + mouseX + " " + mouseY);
}

function render() {
    camera.position.x += ( mouseX - camera.position.x ) * 0.05;
    camera.position.y += ( - mouseY - camera.position.y ) * 0.05;
    //camera.position.z += 0.01;
    //if (camera.position.z > 1000) {
    //  camera.position.z = -1000;
    //}
    //console.log(camera.position.z);
    camera.lookAt( scene.position );
    geometries.rotation.x += 0.004;
    geometries.rotation.y += 0.005;
    geometries.rotation.z += 0.006;

    renderer.render( scene, camera );
}

function animate() {

    requestAnimationFrame( animate );
    //for (var i = 0; i < atoms.length; i++) {
        //atoms[i].rotation.x += 0.01;
        //atoms[i].rotation.y += 0.02;
        //atoms[i].rotation.z += 0.03;
    //}
    render();
    stats.update();
    //renderer.render( scene, camera );
}
