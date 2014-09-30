function det(p1, p2, p3) {
  //console.log(p1['x'], p3['x'], p2['x']);
  return (p1['x'] - p2['x'])*(p3['y'] - p2['y']) - (p1['y'] - p2['y'])*(p3['x'] - p2['x']);
}
function positioning(p1, p2, tested_point) {
  //console.log(p1['x'], tested_point['x'], p2['x']);
  return tested_point['x'] * (p2['y'] - p1['y'])
    + tested_point['y'] * (p2['x'] - p1['x']) + p1['y'] * p2['x'] - p1['x'] * p2['y'] >= 0;
}

function hit_test(p1, p2, p3, tested_point) {
  console.log("in hit_test: ", p1, p2, p3, tested_point);
  hr1 = positioning(p1, p2, tested_point);
  hr2 = positioning(p2, p3, tested_point);
  hr3 = positioning(p3, p1, tested_point);
  return (hr1 == hr2 && hr2 == hr3);
}

function hit_test2(p1, p2, p3, tested_point) {
  console.log("in hit_test2: ", p1, p2, p3, tested_point);
  hr1 = det(p1, p3, p2);
  hr2 = det(p1, p3, tested_point);
  return (hr1*hr2 > 0);
}


EarClipper = function(points) {
  this.ears = [];
  this.unprocessed_size = points.length;
  this.unprocessed_points = points;
  this.det_sign = 1;

  this.find_ears = function() {
    var index = -1;
    while (true) {
      index = this.find_next_ear(index);
      if (index < 0)
        break;
    }
  };
  this.getEars = function() {
    //this.check_points_ordering();
    this.det_sign = 1;
    this.find_ears();
    return this.ears;
  };

  /** checks if points are counterclockwise or clockwise directed
    * paper.js Path object has 'clockwise' property, but i decided to implement this too
    */
  this.check_points_ordering = function() {
    counter = 0;
    for (index in this.unprocessed_points) {
      p1 = unprocessed_points[this.unprocessed_points[index]['prev']].point;
      p2 = this.unprocessed_points[index].point;
      p3 = unprocessed_points[this.unprocessed_points[index]['next']].point;

      if (det(p1, p2, p3) <= 0) {
        counter += 1;
      }
    }
    if (counter > this.unprocessed_size - counter)
    //if (counter == this.unprocessed_size)
      this.det_sign = -1;
  };

  this.check_if_ear = function(point_index1, point_index2, point_index3, p1, p2, p3){

    var test_passed = true;
    i2 = this.unprocessed_points[point_index3]['next'];
    while (i2 != point_index1) {
      hit_result = hit_test2(p1, p2, p3, this.unprocessed_points[i2].point);
      test_passed = test_passed && !hit_result;
      if (test_passed)
        break;
      i2 = this.unprocessed_points[i2]['next'];
    }
    return test_passed;
  }

  this.find_next_ear = function(last_found) {
    var i1 = 0;
    var counter = 0;
    if (this.unprocessed_size == 0) {
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
        i1 = this.unprocessed_points[last_found]['prev'];
      }
      var last_i = i1;
      counter = 0;
      while (true) {
        //console.log(i1, last_i);
        point_index1 = this.unprocessed_points[i1]['prev'];
        point_index2 = i1;
        point_index3 = this.unprocessed_points[i1]['next'];
        p1 = this.unprocessed_points[point_index1].point;
        p2 = this.unprocessed_points[point_index2].point;
        p3 = this.unprocessed_points[point_index3].point;
        if (det(p1, p2, p3)*this.det_sign <= 0) {
          i1 = this.unprocessed_points[i1]['next'];
          continue;
        }
        var test_passed = this.check_if_ear(point_index1, point_index2, point_index3, p1, p2, p3);
        if (test_passed) {
          console.log("test passed by point ", i1);
          p = this.unprocessed_points[i1]['prev'];
          n = this.unprocessed_points[i1]['next'];
          this.ears.push([i1, p, n]);
          this.unprocessed_points[p]['next'] = n;
          this.unprocessed_points[n]['prev'] = p;
          this.unprocessed_size -= 1;
          console.log("got counter value, with result: ", counter);
          return i1;
        }
        counter++;
        i1 = this.unprocessed_points[i1]['next'];
        if (i1 == last_i)
          break;
      }
      console.log("got counter value(no result): ", counter);
    }
    return -1;
    }
}
