var atomInfo = {};

Vector = function(x_, y_, z_) {
  this.x = x_,
  this.y = y_,
  this.z = z_;

  this.subVectors = function(a, b) {
    return new Vector(a.x - b.x, a.y - b.y, a.z - b.z);
  }
  this.copy = function(a) {
    x = a.x;
    y = a.y;
    z = a.z;
    return this;
  }
  this.sub = function(a) {
    console.log("sub called " + this.x + " " + a.x);
    return new Vector(this.x - a.x, this.y - a.y, this.z - a.z);
  }
  this.multiplyScalar = function(k) {
    return new Vector(this.x * k, this.y * k, this.z * k);
  }
  this.add = function(a) {
    return new Vector(this.x + a.x, this.y + a.y, this.z + a.z);
  }

  this.dot = function(v) {
    return (this.x * v.x + this.y * v.y + this.z * v.z);
  }
  this.length = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  this.asVector3 = function() {
    return new THREE.Vector3(this.x, this.y, this.z);
  }
}

function parseAtomInfo(line) {
    var result = new Vector(0, 0, 0);
    result["serial"] = parseInt(line.substring(6, 11));
    result["atom"] = line.substring(12, 16);
    result["altLoc"] = line[16];
    result["resName"] = line.substring(17, 20);
    result["chainID"] = line[21];
    result["resSeq"] = parseInt(line.substring(22, 26));
    result["iCode"] = line[26];
    result["x"] = parseFloat(line.substring(30, 38));
    result["y"] = parseFloat(line.substring(38, 46));
    result["z"] = parseFloat(line.substring(46, 54));
    result["occupancy"] = parseFloat(line.substring(54, 60));
    result["tempFactor"] = parseFloat(line.substring(60, 66));
    result["element"] = line.substring(76, 78).trim();
    result["charge"] = line.substring(78, 80);

    result.radius = function() {
      if (this["element"] == "C") {
        return 1.7;
      }
      if (this["element"] == "H") {
        return 1.2;
      }
      if (this["element"] == "O") {
        return 1.52;
      }
      if (this["element"] == "N") {
        return 1.55;
      }
      return 0.3;
    }

    return result;
}

function loadATOMInfo(str, grouped) {
    lines = str.split("\n");

    for (var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf("ATOM") == 0) {
            parsedStr = parseAtomInfo(lines[i]);
            if (atomInfo[parsedStr["chainID"]] == null) {
              atomInfo[parsedStr["chainID"]] = (grouped ? {} : [] );
            }
            if (grouped) {
              if (atomInfo[parsedStr["chainID"]][parsedStr["resSeq"]] == null) {
                atomInfo[parsedStr["chainID"]][parsedStr["resSeq"]] = [];
              }
              atomInfo[parsedStr["chainID"]][parsedStr["resSeq"]].push(parsedStr);
            } else {
              atomInfo[parsedStr["chainID"]].push(parsedStr);
            }
        }
    }
}

function handleFileSelect(evt) {
    var file = evt.target.files[0]; // FileList object

    var reader = new FileReader();
    // Closure to capture the file information.
    reader.onload = (function(file) {
        return function(e) {
          console.log("file loaded");
          // Render thumbnail.
          loadATOMInfo(e.target.result, false);
          //console.log(atomInfo);
          init();
          animate();
        };
      })(file);

      // Read in the image file as a data URL.
      reader.readAsText(file);
}

document.getElementById('files').addEventListener('change', handleFileSelect, false);
