function det(p1, p2, p3) {
  //console.log(p1['x'], p3['x'], p2['x']);
  return (p1['x'] - p2['x'])*(p3['y'] - p2['y']) - (p1['y'] - p2['y'])*(p3['x'] - p2['x']);
}

function positioning2(p1, p2, tested_point) {
  //console.log(p1['x'], tested_point['x'], p2['x']);
  return tested_point['x'] * (p2['y'] - p1['y'])
    + tested_point['y'] * (p2['x'] - p1['x']) + p1['y'] * p2['x'] - p1['x'] * p2['y'];
}
function positioning(p1, p2, tested_point) {
  //console.log(p1['x'], tested_point['x'], p2['x']);
  return positioning2(p1, p2, tested_point) >= 0;
}

function hit_test(p1, p2, p3, tested_point) {
  //console.log("in hit_test: ", p1, p2, p3, tested_point);
  hr1 = positioning(p1, p2, tested_point);
  hr2 = positioning(p2, p3, tested_point);
  hr3 = positioning(p3, p1, tested_point);
  return (hr1 == hr2 && hr2 == hr3);
}

function hit_test2(p1, p2, p3, tested_point) {
  console.log("in hit_test2: ", p1, p2, p3, tested_point);
  hr1 = det(p1, p3, p2);
  hr2 = det(p1, p3, tested_point);
  console.log(hr1, hr2, (hr1 > 0 && hr2 < 0) || (hr1 < 0 && hr2 > 0));
  return (hr1 > 0 && hr2 > 0) || (hr1 < 0 && hr2 < 0);
}


EarClipper = function(points) {
  this.ears = [];
  this.unprocessed_size = points.length;
  this.unprocessed_points = points;
  this.det_sign = 1;

  this.find_ears = function() {
    var index = -1;
    var c = 0;
    while (true) {
      console.log("in find ears");
      index = this.find_next_ear(index);
      c++;
      console.log("got ear number ", c);
      if (index < 0)
        break;
    }
    console.log("end of find_ears");
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

    i2 = this.unprocessed_points[point_index3]['next'];
    console.log("check if ear ", i2);
    while (i2 != point_index1) {
      hit_result = hit_test(p1, p2, p3, this.unprocessed_points[i2].point);
      console.log("check if ear2 ", i2, hit_result );
      if (hit_result)
        return false;
      i2 = this.unprocessed_points[i2]['next'];
    }
    return true;
  }

  this.find_next_ear = function(last_found) {
    var i1 = 0;
    var counter = 0;
    console.log(this.unprocessed_size);
    if (this.unprocessed_size == 0) {
      return -1;
    }
    if (this.unprocessed_size <= 3) {
      i1 = (last_found >= 0 ? this.unprocessed_points[last_found]['prev'] : 0);
      p = this.unprocessed_points[i1]['prev'];
      n = this.unprocessed_points[i1]['next'];
      this.ears.push([i1, p, n]);
      this.unprocessed_size = 0;
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
        console.log(counter, this.unprocessed_size);
        var point_index1 = this.unprocessed_points[i1]['prev'];
        var point_index2 = i1;
        var point_index3 = this.unprocessed_points[i1]['next'];
        var p1 = this.unprocessed_points[point_index1].point;
        var p2 = this.unprocessed_points[point_index2].point;
        var p3 = this.unprocessed_points[point_index3].point;
        //if (det(p1, p2, p3)*this.det_sign <= 0) {
        //  i1 = this.unprocessed_points[i1]['next'];
        //  continue;
        //}
        var test_passed = this.check_if_ear(
          point_index1, point_index2, point_index3,
          p1, p2, p3);
        console.log("check if ear returned: ", test_passed);
        if (test_passed) {
          console.log("test passed by point ", i1);
          this.ears.push([point_index2, point_index1, point_index3]);
          this.unprocessed_points[point_index1]['next'] = point_index3;
          this.unprocessed_points[point_index3]['prev'] = point_index1;
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
