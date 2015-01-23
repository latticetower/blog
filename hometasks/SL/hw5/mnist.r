# Load the MNIST digit recognition dataset into R
# http://yann.lecun.com/exdb/mnist/
# assume you have all 4 files and gunzip'd them
# creates train$n, train$x, train$y  and test$n, test$x, test$y
# e.g. train$x is a 60000 x 784 matrix, each row is one digit (28x28)
# call:  show_digit(train$x[5,])   to see a digit.
# brendan o'connor - gist.github.com/39760 - anyall.org

load_image_file <- function(filename) {
  ret = list()
  f = file(filename,'rb')
  readBin(f,'integer',n=1,size=4,endian='big')
  ret$n = readBin(f,'integer',n=1,size=4,endian='big')
  nrow = readBin(f,'integer',n=1,size=4,endian='big')
  ncol = readBin(f,'integer',n=1,size=4,endian='big')

  x = readBin(f,'integer',n=ret$n*nrow*ncol,size=1,signed=F)
  ret$x = matrix(x, ncol=nrow*ncol, byrow=T)
  close(f)
  ret
}

load_image_file2 <- function(filename) {
  ret = list()
  f = file(filename,'rb')
  readBin(f,'integer',n=1,size=4,endian='big')
  ret$n = readBin(f,'integer',n=1,size=4,endian='big')
  ret$nrow = readBin(f,'integer',n=1,size=4,endian='big')
  ret$ncol = readBin(f,'integer',n=1,size=4,endian='big')
  x = readBin(f,'integer',n=ret$n*ret$ncol*ret$nrow,size=1,signed=F)
  ret$x = matrix(x, nrow=ret$n, byrow=T)
  close(f)
  ret
}
load_label_file <- function(filename) {
  f = file(filename,'rb')
  readBin(f,'integer',n=1,size=4,endian='big')
  n = readBin(f,'integer',n=1,size=4,endian='big')
  y = readBin(f,'integer',n=n,size=1,signed=F)
  close(f)
  y
}

save_image_file <- function(filename, data, n, ncol, nrow) {
  f = file(filename,'wb')
  writeBin(1, f, endian='big', size=4)
  writeBin(n, f, endian='big', size=4)
  writeBin(nrow, f, endian='big', size=4)
  writeBin(ncol, f, endian='big', size=4)
  x = writeBin(as.vector(matrix(t(data[, -1]), nrow = 1)[1, ]),f, size=1)
  close(f)
}

save_label_file <- function(filename, n, v) {
  f = file(filename,'wb')
  writeBin(2, f,size=4,endian='big')
  writeBin(n, f,size=4,endian='big')
  #print(as.vector(v))
  writeBin(as.integer(as.vector(v)), f,size=1)
  close(f)
}

load_mnist <- function() {

  train <- load_image_file('mnist/train-images.idx3-ubyte')
  test <- load_image_file('mnist/t10k-images.idx3-ubyte')
  
  train$y <- load_label_file('mnist/train-labels.idx1-ubyte')
  test$y <- load_label_file('mnist/t10k-labels.idx1-ubyte')  
  mnist.train <<-data.frame(y=train$y, x=train$x)
  mnist.test <<- data.frame(y=test$y, x=test$x)

}


show_digit <- function(arr784, col=gray(12:1/12), ...) {
  image(matrix(arr784, nrow=28)[,28:1], col=col, ...)
}
