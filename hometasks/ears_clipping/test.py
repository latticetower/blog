import sys
import re

class Polygon(object):
  def __init__(self, points):
    self.unprocessed_points = [{'x': point[0], 'y': point[1], 'p': 0, 'n': 0} for point in points]
    self.unprocessed_size = 0
    for i in range(len(self.unprocessed_points)):
      self.unprocessed_size += 1
      self.unprocessed_points[i]['p'] = i - 1
      self.unprocessed_points[i]['n'] = i + 1
      self.unprocessed_points[i]['i'] = i #index of current point
      if i + 1 >= len(self.unprocessed_points):
        self.unprocessed_points[i]['n'] = 0
      if i - 1 < 0 :
        self.unprocessed_points[i]['p'] = len(self.unprocessed_points) - 1
    #for point in self.unprocessed_points:
    #  print point
    self.ears = []
    print "in init"
  def det(self, p1, p2, p3):
    return (p1['x'] - p2['x'])*(p3['y'] - p2['y']) - (p1['y'] - p2['y'])*(p3['x'] - p2['x'])
  def positioning(self, p1, p2, tested_point):
    #print "{0} {1} {2}".format(p1, p2, tested_point)
    return tested_point['x']* (p2['y'] - p1['y']) + tested_point['y'] * (p2['x'] - p1['x']) + p1['y'] * p2['x'] - p1['x'] * p2['y'] >= 0
  def hit_test(self, p1, p2, p3, tested_point):
    hr1 = self.positioning(p1, p2, tested_point)
    hr2 = self.positioning(p2, p3, tested_point)
    hr3 = self.positioning(p3, p1, tested_point)
    #print "{0}, {1}, {2}".format(hr1, hr2, hr3)
    return hr1 == hr2 and hr2 == hr3
  #
  def find_next_ear(self, last_found):
    print "find_next_ear called {0}".format(self.unprocessed_size)
    if self.unprocessed_size == 0:
      print "in find_next_ear with no data"
      return -1
    if self.unprocessed_size <= 3:
      i1 = 0
      if last_found >= 0:
        i1 = last_found
      self.ears.append(self.unprocessed_points[i1]['n'])
      return -1
    else:
      i1 = 0
      if last_found >= 0:
        print "last found: {0}".format(self.unprocessed_points[last_found])
        i1 = self.unprocessed_points[last_found]['p']
        #print i1
        #exit()
      last_i = self.unprocessed_points[i1]['p']
      while (i1 != last_i):
        print "i1: {0}".format(i1)
        p1 = self.unprocessed_points[self.unprocessed_points[i1]['p']]
        p2 = self.unprocessed_points[i1]
        p3 = self.unprocessed_points[self.unprocessed_points[i1]['n']]
        #print "{0} {1} {2}".format(p1, p2, p3)
        if self.det(p1, p2, p3) <= 0:
          print "continue det"
          continue
        test_passed = True
        i2 = p3['n']
        while (i2 != p1['i']):
          hit_result = self.hit_test(p1, p2, p3, self.unprocessed_points[i2])
          #print hit_result
          test_passed = test_passed and not hit_result
          #print "tested {0}".format(test_passed)
          i2 = self.unprocessed_points[i2]['n']
        if test_passed:
          #print "test passed"
          self.ears.append(i1)
          p = self.unprocessed_points[i1]['p']
          n = self.unprocessed_points[i1]['n']
          print "{2}, {0}!={1}".format(self.unprocessed_points[p]['n'], n, p)
          print self.unprocessed_points
          self.unprocessed_points[p]['n'] = n
          self.unprocessed_points[n]['p'] = p
          print "{2}, {0}!={1}".format(self.unprocessed_points[p]['n'], n, p)
          print self.unprocessed_points
          self.unprocessed_size -= 1
          #exit()
          return i1
        i1 = self.unprocessed_points[i1]['n']
      print "TODO: should find some ear and clip point"
    return -1
  def print_triangle(self, index):
    print "triangle: {0}, {1}, {2}".format(
      self.unprocessed_points[index],
      self.unprocessed_points[self.unprocessed_points[index]['p']],
      self.unprocessed_points[self.unprocessed_points[index]['n']]
      )
  def find_ears(self):
    index = -1
    while True:
      index = self.find_next_ear(-1)
      if index < 0:
        break
      print "{0}: {1}".format(index, self.unprocessed_points[index])
    print "in find ears, {0}".format(index)
  def get_ears(self):
    return self.ears


def load_point(str):
  r = re.compile('[\-0-9]+')
  return [int(s) for s in r.findall(str)]

def main():
  n = int(sys.stdin.readline())
  points = [load_point(sys.stdin.readline()) for x in range(n)]
  print points
  polygon = Polygon(points)
  polygon.find_ears()
  for ear in polygon.get_ears():
    polygon.print_triangle(ear)
  return 0

def test():
  triangle = [load_point(sys.stdin.readline()) for x in range(3)]
  print triangle
  point = load_point(sys.stdin.readline())
  polygon = Polygon(triangle)
  print polygon.hit_test(triangle[0],triangle[1], triangle[2], point)
if __name__ == "__main__": main()
