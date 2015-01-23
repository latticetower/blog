#this preprocessor should 
rm(list = ls(all.names = TRUE))
library(e1071)
library(MASS)
library(raster)
source("PCA/PCAfncs.R")
source("mnist.r") # http://yann.lecun.com/exdb/mnist/

library(data.table)


train <- load_image_file2('mnist/train-data.changed')
train$y <- load_label_file('mnist/train-labels.changed')

test <- load_image_file2('mnist/test-data.changed')
test$y <- load_label_file('mnist/test-labels.changed')

mnist.train <- train$x #[1:10, ]

mnist.test <- test$x #[1:1000, ]
maxheight<-20

check.weight <- function(digit) {
  w <- 0
  x <- 0
  y <- 0
  #following helper method simply fills connected area with 0 value, from point [r, c]
  newdigit <<- matrix(digit, nrow = maxheight)
  for (i in 1: nrow(newdigit)) {
    for (j in 1: ncol(newdigit)) {
      w <- w + newdigit[i, j]
      x <- x + i*newdigit[i, j]
      y <- y + j*newdigit[i, j]
    }
  }
  x <- round(x/w)
  y <- round(y/w)
  list(w=w, x=x, y=y)
}

train.weight <- NULL
train.weight.x <- NULL
train.weight.y <- NULL
for (i in 1: nrow(mnist.train)) {
  weight.info <- check.weight(mnist.train[i, ])
  train.weight <- c(train.weight, weight.info$w)
  train.weight.x <- c(train.weight.x, weight.info$x)
  train.weight.y <- c(train.weight.y, weight.info$y)
}

test.weight <- NULL
test.weight.x <- NULL
test.weight.y <- NULL
for (i in 1: nrow(mnist.test)) {
  weight.info <- check.weight(mnist.test[i, ])
  test.weight <- c(test.weight, weight.info$w)
  test.weight.x <- c(test.weight.x, weight.info$x)
  test.weight.y <- c(test.weight.y, weight.info$y)
}
print(min(train.weight.x))
print(max(train.weight.x))
print(min(train.weight.y))
print(max(train.weight.y))

print(min(test.weight.x))
print(max(test.weight.x))
print(min(test.weight.y))
print(max(test.weight.y))


save_label_file('mnist/train-data.weight', nrow(mnist.train), train.weight)

save_label_file('mnist/test-data.weight', nrow(mnist.test), test.weight)


save_label_file('mnist/train-data.weight.x', nrow(mnist.train), train.weight.x)
save_label_file('mnist/test-data.weight.x', nrow(mnist.test), test.weight.x)

save_label_file('mnist/train-data.weight.y', nrow(mnist.train), train.weight.y)
save_label_file('mnist/test-data.weight.y', nrow(mnist.test), test.weight.y)


