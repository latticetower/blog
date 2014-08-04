var atomInfo = {};

Vector = function(px, py) {
  this.x = px;
  this.y = py;

  this.subVectors = function(a, b) {
    return new Vector(a.x - b.x, a.y - b.y);
  }

  this.equals = function(v) {
    return this.x == v.x && this.y == v.y;
  }

  this.copy = function(a) {
    x = a.x;
    y = a.y;
    return this;
  }

  this.sub = function(a) {
    //console.log("sub called " + this.x + " " + a.x);
    return new Vector(this.x - a.x, this.y - a.y);
  }

  this.multiplyScalar = function(k) {
    return new Vector(this.x * k, this.y * k);
  }

  this.rad2 = function() {
    return this.x * this.x + this.y * this.y;
  }
  
  this.add = function(a) {
    return new Vector(this.x + a.x, this.y + a.y);
  }

  this.dot = function(v) {
    return (this.x * v.x + this.y * v.y);
  }
  this.length = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  this.asVector3 = function() {
    return new THREE.Vector3(this.x, this.y, 0);
  }

  this.toString = function() {
    return "[" + this.x + ", " + this.y + "], ";
  }
}

function handleLoad(e) {
  console.log("load event occured");
    init();
    animate();
}

window.addEventListener('load', handleLoad, false);
