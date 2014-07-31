var atomInfo = {};

function parseAtomInfo(line) {
    var result = {}
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
    result.asVector3 = function() {
      return new THREE.Vector3(this["x"], this["y"], this["z"]);
    }

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

function loadATOMInfo(str) {
    lines = str.split("\n");

    for (var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf("ATOM") == 0) {
            parsedStr = parseAtomInfo(lines[i]);
            if (atomInfo[parsedStr["chainID"]] == null) {
              atomInfo[parsedStr["chainID"]] = {};
            }
            if (atomInfo[parsedStr["chainID"]][parsedStr["resSeq"]] == null) {
              atomInfo[parsedStr["chainID"]][parsedStr["resSeq"]] = [];
            }
            atomInfo[parsedStr["chainID"]][parsedStr["resSeq"]].push(parsedStr);
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
          loadATOMInfo(e.target.result);
          //console.log(atomInfo);
          init();
          animate();
        };
      })(file);

      // Read in the image file as a data URL.
      reader.readAsText(file);
}

document.getElementById('files').addEventListener('change', handleFileSelect, false);
