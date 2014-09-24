function det(p1, p2, p3) {
  console.log("in det: ", p1, p2, p3,
  (p1['x'] - p2['x'])*(p3['y'] - p2['y']) - (p1['y'] - p2['y'])*(p3['x'] - p2['x'])
  );
  console.log(
    (p1['x'] - p2['x']),
    (p3['y'] - p2['y']), (p1['y'] - p2['y']),
    (p3['x'] - p2['x'])
    );
  console.log(
    (p1['x'] - p2['x'])*(p3['y'] - p2['y']),
    - (p1['y'] - p2['y'])*(p3['x'] - p2['x'])
    );
  return (p1['x'] - p2['x'])*(p3['y'] - p2['y']) - (p1['y'] - p2['y'])*(p3['x'] - p2['x']);
}
function positioning(p1, p2, tested_point) {
  return tested_point['x'] * (p2['y'] - p1['y'])
    + tested_point['y'] * (p2['x'] - p1['x']) + p1['y'] * p2['x'] - p1['x'] * p2['y'] >= 0;
}

function hit_test(p1, p2, p3, tested_point) {
  //console.log("in hit_test: ", p1, p2, p3, tested_point);
  hr1 = positioning(p1, p2, tested_point);
  hr2 = positioning(p2, p3, tested_point);
  hr3 = positioning(p3, p1, tested_point);
  return (hr1 == hr2 && hr2 == hr3);
}

EarClipper = function(segments, points) {
  this.ears = [];
  this.unprocessed_size = points.length;
  this.unprocessed_points = points;
  this.segments = segments; // read-only usage
  this.det_sign = 1;
  this.find_ears = function() {
    var index = -1;
    while (true) {
      index = this.find_next_ear(index);
      if (index < 0)
        break;
      //print "{0}: {1}".format(index, this.unprocessed_points[index])
    }
    //print "in find ears, {0}".format(index)
  };
  this.getEars = function() {
    this.check_points_ordering();

    this.find_ears();
    return this.ears;
  };

  this.check_points_ordering = function() {
    counter = 0;
    for (index in this.unprocessed_points) {
      p1 = this.segments[this.unprocessed_points[index]['prev']].point;
      p2 = this.segments[index].point;
      p3 = this.segments[this.unprocessed_points[index]['next']].point;

      if (det(p1, p2, p3) <= 0) {
        counter += 1;
      }
    }
    if (counter > this.unprocessed_size - counter)
      this.det_sign = -1;
  };

  this.find_next_ear = function(last_found) {
    //print "find_next_ear called {0}".format(this.unprocessed_size)
    if (this.unprocessed_size == 0) {
      //print "in find_next_ear with no data"
      return -1;
    }
    if (this.unprocessed_size <= 3) {
      i1 = (last_found >= 0 ? last_found : 0);
      this.ears.push(this.unprocessed_points[i1]['next']);
      return -1;
    }
    else {
      i1 = 0;
      if (last_found >= 0) {
        //print "last found: {0}".format(this.unprocessed_points[last_found])
        i1 = this.unprocessed_points[last_found]['prev'];
        //#print i1
        //#exit()
      }
      var last_i = this.unprocessed_points[i1]['prev'];
      var concaves_counter = 0;
      while (i1 != last_i) {
        //print "i1: {0}".format(i1)
        point_index1 = this.unprocessed_points[i1]['prev'];
        point_index2 = i1;
        point_index3 = this.unprocessed_points[i1]['next'];
        console.log("indices: ", point_index1, point_index2, point_index3);
        p1 = this.segments[point_index1].point;
        p2 = this.segments[point_index2].point;
        p3 = this.segments[point_index3].point;
        //#print "{0} {1} {2}".format(p1, p2, p3)
        if (det(p1, p2, p3)*this.det_sign <= 0) {
          console.log("continue det: ", p1, p2, p3, det(p1, p2, p3));
          i1 = this.unprocessed_points[i1]['next'];
          //return -1;
          continue;
        }
        //return -1;
        test_passed = true;
        i2 = point_index3['next'];
        while (i2 != point_index1['index']) {
          hit_result = hit_test(p1, p2, p3, this.segments[i2]);
          //#print hit_result
          test_passed = test_passed && !hit_result;
          //console.log("i")
          //#print "tested {0}".format(test_passed)
          i2 = this.unprocessed_points[i2]['next'];
        }
        if (test_passed) {
          //#print "test passed"
          this.ears.push(i1);
          p = this.unprocessed_points[i1]['prev'];
          n = this.unprocessed_points[i1]['next'];
          //print "{2}, {0}!={1}".format(this.unprocessed_points[p]['n'], n, p)
          //print this.unprocessed_points
          this.unprocessed_points[p]['next'] = n;
          this.unprocessed_points[n]['prev'] = p;
          //print "{2}, {0}!={1}".format(this.unprocessed_points[p]['n'], n, p)
          //print this.unprocessed_points
          this.unprocessed_size -= 1;
          //#exit()
          return i1;
        }
        console.log("in outer cycle: ", i1, this.unprocessed_points[i1]['next'])
        i1 = this.unprocessed_points[i1]['next'];
      }
      //print "TODO: should find some ear and clip point"
    }
    return -1;
    }
}
