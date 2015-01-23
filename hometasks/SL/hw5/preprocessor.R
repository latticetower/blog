
rm(list = ls(all.names = TRUE))
library(e1071)
library(MASS)
library(raster)
source("PCA/PCAfncs.R")
source("mnist.r") # http://yann.lecun.com/exdb/mnist/
load_mnist()
train<- mnist.train[1:10, ]
mnist.train <- train
test <- mnist.test[1:1000, ]
mnist.test <- test

library(data.table)


check.borders <- function(j, digit, borders) {
  c<-colSums(digit)
  colmin <- 0
  colmax <- ncol(digit)  
  for (i in 1:ncol(digit)) {
    if (c[i]>0) break
    colmin<- i
  }
  for (i in ncol(digit):1) {
    colmax <- i
    if (c[i]>0) break
  }
  r <- rowSums(digit)
  rowmin <- 0
  rowmax <- nrow(digit)  
  for (i in 1:nrow(digit)) {
    if (r[i]>0) break
    rowmin<- i
  }
  for (i in nrow(digit):1) {
    rowmax <- i
    if (r[i]>0) break
  }
  set(borders, as.integer(j), 1, colmin)
  set(borders, as.integer(j), 2, colmax)
  set(borders, as.integer(j), 3, rowmin)
  set(borders, as.integer(j), 4, rowmax)
} 

resize.matrix <- function(dataset, i, digit, maxwidth, maxheight, digit.borders, newtrain) {
  temp.matrix <- matrix(0, nrow =maxheight, ncol=maxwidth)
  offsetrow <- 0
  offsetcol <- 0
  if (digit.borders$colmax - digit.borders$colmin <maxwidth) {
    offsetcol <- (maxwidth - (digit.borders$colmax - digit.borders$colmin)) %/% 2
  }
  if (digit.borders$rowmax - digit.borders$rowmin <maxheight) {
    offsetrow <- (maxheight - (digit.borders$rowmax - digit.borders$rowmin)) %/% 2
  }
  for (k in 1 : (digit.borders$rowmax - digit.borders$rowmin)) {
    for (j in 1 : (digit.borders$colmax -  digit.borders$colmin)) {
      temp.matrix[offsetcol + j, offsetrow + k]<- digit[   digit.borders$colmin + j, digit.borders$rowmin+k]
    }
  }
  #print(temp.matrix)

  set(newtrain, as.integer(i), 1, dataset[i, 1])
  newdigit<-matrix(t(temp.matrix), nrow=1, byrow=T)

  for (j in 1: ncol(newdigit)) {
    #print(j)
    set(newtrain, as.integer(i), as.integer(j+1), newdigit[j])
  }
  
}
prepare.dataset <- function(dataset, borders) {
  for (i in 1: nrow(dataset)) {
    check.borders(i, matrix(t(dataset[i, -1]), nrow = 28), borders)
  }
}
trim.dataset <- function(dataset, borders, newtrain) {
  for (i in 1: nrow(dataset)) {
    resize.matrix(dataset, i, matrix(t(dataset[i, -1]), nrow=28, byrow=T), 
                  maxwidth, maxheight, borders[i], newtrain)
  }
}

nrecords<-nrow(mnist.train)
borders <- data.table(colmin = rep(0, nrecords), 
                      colmax = rep(1, nrecords), 
                      rowmin = rep(0, nrecords), 
                      rowmax = rep(1, nrecords))
prepare.dataset(mnist.train, borders)
maxwidth1 <- max(borders$colmax - borders$colmin)
maxheight1 <- max(borders$rowmax - borders$rowmin)
newtrain <- data.table(y = rep(0, nrecords), x = matrix(rep(1:(maxwidth1*maxheight1), nrecords), nrow=nrecords))


nrecords2<-nrow(mnist.test)
borders2 <- data.table(colmin = rep(0, nrecords2), 
                      colmax = rep(1, nrecords2), 
                      rowmin = rep(0, nrecords2), 
                      rowmax = rep(1, nrecords2))

prepare.dataset(mnist.test, borders2)
maxwidth2 <- max(borders2$colmax - borders2$colmin)
maxheight2 <- max(borders2$rowmax - borders2$rowmin)

newtrain2 <- data.table(y = rep(0, nrecords2), x = matrix(rep(1:(maxwidth2*maxheight2), nrecords2), nrow=nrecords2))



maxwidth <- max(maxwidth1, maxwidth2)
maxheight <- max(maxheight2, maxheight2)
trim.dataset(mnist.train, borders, newtrain)

trim.dataset(mnist.test, borders2, newtrain2)

mnist.train<-as.data.frame(newtrain)
mnist.train$y <- factor(mnist.train$y)

mnist.test <-as.data.frame(newtrain2)
mnist.test$y <- factor(mnist.test$y)

save_image_file('mnist/train-data.changed', mnist.train, nrow(mnist.train), as.integer(maxwidth), as.integer(maxheight))
save_label_file('mnist/train-labels.changed', nrow(mnist.train), mnist.train[,1])

show_digit <- function(arr784, col = gray(12:1/12), ...) {
  image(matrix(arr784, nrow = maxheight)[, maxheight:1], col = col, ...)
}
show_digit(as.matrix(mnist.train[1, -1]), main = mnist.train[1, 1])
show_digit(as.matrix(mnist.train[2, -1]), main = mnist.train[2, 1])
show_digit(as.matrix(mnist.train[3, -1]), main = mnist.train[3, 1])

train <- load_image_file2('mnist/train-data.changed')
train.y <- load_label_file('mnist/train-labels.changed')

show_digit(matrix(train$x[1,], nrow=train$nrow), main = train.y[1])
show_digit(matrix(train$x[2,], nrow=train$nrow), main = train.y[2])
show_digit(matrix(train$x[8,], nrow=train$nrow), main = train.y[8])
  

