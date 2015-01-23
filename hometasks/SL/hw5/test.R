rm(list = ls(all.names = TRUE))
library(e1071)
library(MASS)
source("PCA/PCAfncs.R")
source("mnist.r") # http://yann.lecun.com/exdb/mnist/
load_mnist()
mnist.train$y <- factor(mnist.train$y)

deskew <- function(df, mincol=1, maxcol=ncol(df), threshold=1.10) {
  for (i in mincol:maxcol) {
    t <- log(1+df[i])[, 1]#min(df[i])
    if (is.nan(skewness(t, na.rm=TRUE)))
      next 
    if (abs(skewness(df[,i], na.rm=TRUE)) > threshold * abs(skewness(t, na.rm=TRUE)))
      df[i] <- t
  }
  df
}

pcalda <- function(...) pcawrap(lda, ...)
predict.pcalda <- function(...) predict(...)$class
show_digit <- function(arr784, col = gray(12:1/12), ...) {
    image(matrix(arr784, nrow = 28)[, 28:1], col = col, ...)
}
show_digit(as.matrix(mnist.train[1, -1]), main = mnist.train[1, 1])
show_digit(as.matrix(mnist.train[2, -1]), main = mnist.train[2, 1])
show_digit(as.matrix(mnist.train[3, -1]), main = mnist.train[3, 1])

library(raster)
for (i in 1:nrow(mnist.train)) {
  r <- raster(matrix(t(mnist.train[i, -1]), nrow = 28))
  r3 <- focal(r, w=matrix(1/9,nrow=3,ncol=3)) 
  mnist.train[i, -1] <- as.matrix(r3)
}

for (i in 1:nrow(mnist.test)) {
  r <- raster(matrix(t(mnist.test[i, -1]), nrow = 28))
  r3 <- focal(r, w=matrix(1/9,nrow=3,ncol=3)) 
  mnist.test[i, -1] <- as.matrix(r3)
}


# 3x3 mean filter


show_digit(as.matrix(mnist.train[4, -1]), main = mnist.train[4, 1])

sds <- sapply(mnist.train, sd)
zero.sd <- names(mnist.train)[sds < 2]
mnist.train.nz <- mnist.train[, setdiff(names(mnist.train), zero.sd)]
mnist.train.nz <- deskew(mnist.train.nz, mincol=2)

#sds2 <- sapply(mnist.train.nz, sd)
#zero.sd2 <- names(mnist.train.nz)[sds < 2]
#mnist.train.nz <- mnist.train.nz [, setdiff(names(mnist.train.nz), zero.sd2)]

tn.lda <- tune(lda, y ~ ., data = mnist.train.nz,
               predict.func = predict.pcalda, tunecontrol = tune.control(cross = 2))
summary(tn.lda)

table(actual = mnist.train$y, predicted = predict(tn.lda$best.model, mnist.train)$class)

tt <- table(actual = mnist.test$y, predicted = predict(tn.lda$best.model,
                                                       mnist.test)$class)
print(tt)

1 - sum(diag(tt))/sum(tt)

#pcaqda <- function(...) pcawrap(qda, ...)
#predict.pcaqda <- function(...) predict(...)$class
#tn.qda <- tune(qda, y ~ ., data = mnist.train.nz,
#               predict.func = predict.pcaqda,
#               tunecontrol = tune.control(cross = 2))
#summary(tn.qda)

#sds2<-sapply(mnist.train.nz, sd)

show_digit(as.matrix(mnist.train[3, -1]), main = mnist.train[3, 1])

tn.pcaqda <- tune(pcaqda, y ~ ., data = mnist.train.nz,
                  scale = FALSE, center = TRUE,# ranges = list(ncomp = c(1, 10, 20, 40, 50)),
                  ranges = list(ncomp = c(10, 30, 50, 70, 90)),
                  predict.func = predict.pcaqda,
                  tunecontrol = tune.control(cross = 2))
summary(tn.pcaqda)

plot(tn.pcaqda)

table(actual = mnist.train$y,
      predicted = predict(tn.pcaqda$best.model)$class)

tt <- table(actual = mnist.test$y,
            predicted = predict(tn.pcaqda$best.model, mnist.test)$class)
print(tt)

1 - sum(diag(tt)) / sum(tt)


prs <- by(mnist.train, mnist.train$y, function(df) {
  pr <- prcomp(~. - y, data = df, scale = FALSE,
               center = TRUE, ncomp = 3)
})
show_digit(prs[["0"]]$rotation[, 1])
show_digit(prs[["1"]]$rotation[, 1])
show_digit(prs[["3"]]$rotation[, 1])
show_digit(prs[["4"]]$rotation[, 1])
show_digit(prs[["7"]]$rotation[, 1])
