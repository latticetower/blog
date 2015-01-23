mnist
========

Пробовала deskewing, не похоже, что сильно помогло. Пробовала применять фильтры. Стало еще медленней и результаты ухудшились.

Затем мне надоело, что приходится подолгу дожидаться результатов, и я решила обрезать края у цифр и центрировать сами цифры, чтобы сократить количество предикторов и время вычислений. На полученном датасете результаты ухудшились не сильно (точность предсказания осталась на уровне примерно 4%), поэтому решила дальше работать именно с таким, обработанным набором данных. Код, который использовала для обработки:

[Обработчик 1](preprocessor.R)

Результаты deskewing и фильтров не сильно улучшились. Тут я подумала, что имеет смысл добавить немного своих предикторов. А начать с очень простого соображения: что мы знаем про цифры? - у некоторых есть кружочки, у некоторых нет (даже в разных формах написания). Поэтому я посчитала для всех цифр количество связных областей на картинке, не окрашенных в какой-либо цвет (при этом фон картинки справа считается связным с фоном картинки слева, аналогично сверху и снизу):

[Обработчик 2](preprocessor_2.R)

для определения связных участков использовала простой рекурсивный алгоритм заливки контура (раскрашивала найденную область ненулевым цветом и увеличивала счетчик связных областей на 1).

Следующая идея - поворачивать циферки так, чтобы они были максимально "узкими". Это поможет выровнять все 1 (пока не реализовано)


```r
rm(list = ls(all.names = TRUE))
library(e1071)
library(MASS)
library(raster)
```

```
## Loading required package: sp
## 
## Attaching package: 'raster'
## 
## The following objects are masked from 'package:MASS':
## 
##     area, select
## 
## The following object is masked from 'package:e1071':
## 
##     interpolate
```

```r
library(data.table)

source("PCA/PCAfncs.R")
source("mnist.r") # http://yann.lecun.com/exdb/mnist/

train <- load_image_file2('mnist/train-data.changed')
train$y <- load_label_file('mnist/train-labels.changed')
train$cc <- load_label_file('mnist/train-data.connected.comp')
train$weight <- load_label_file('mnist/train-data.weight')
train$wx <- load_label_file('mnist/train-data.weight.x')
train$wy <- load_label_file('mnist/train-data.weight.y')


mnist.train <-data.frame(y=train$y, c=train$cc, w=train$weight, wx=train$wx, wy=train$wy, x=train$x)

test<- load_image_file2('mnist/test-data.changed')
test$y <- load_label_file('mnist/test-labels.changed')
test$cc <- load_label_file('mnist/test-data.connected.comp')
test$weight <- load_label_file('mnist/test-data.weight')
test$wx <- load_label_file('mnist/test-data.weight.x')
test$wy <- load_label_file('mnist/test-data.weight.y')


mnist.test <- data.frame(y=test$y, c=test$cc, w=test$weight, wx=test$wx, wy=test$wy, x=test$x) 

maxwidth <- max(train$ncol, test$ncol)
maxheight <- max(train$nrow, test$nrow)

mnist.train$y <- factor(mnist.train$y)
#mnist.train$c <- factor(mnist.train$c)

mnist.test$y <- factor(mnist.test$y)
#mnist.test$c <- factor(mnist.test$c)


deskew <- function(df, mincol=1, maxcol=ncol(df), threshold=2) {
  for (i in mincol:maxcol) {
    t <- log(1 + df[,i] - min(df[,i]))[, 1]
    if (is.nan(skewness(t, na.rm=TRUE)))
      next 
    if (abs(skewness(df[,i], na.rm=TRUE)) > threshold * abs(skewness(t, na.rm=TRUE)))
      df[,i] <- t
  }
  df
}
pcalda <- function(...) pcawrap(lda, ...)
predict.pcalda <- function(...) predict(...)$class
show_digit <- function(arr784, col = gray(12:1/12), ...) {
    image(matrix(arr784, nrow = maxheight)[, maxheight:1], col = col, ...)
}

#for (i in 1:nrow(mnist.train)) {
#  r <- raster(matrix(t(mnist.train[i, -1]), nrow = 28))
#  r3 <- focal(r, w=matrix(1/9,nrow=3,ncol=3))
#  mm <- as.matrix(r3)
#  mm[is.na(mm)]<-0
#  mnist.train[i, -1] <- mm
#}


#for (i in 1:nrow(mnist.test)) {
#  r <- raster(matrix(t(mnist.test[i, -1]), nrow = 28))
#  r3 <- focal(r, w=matrix(1/9,nrow=3,ncol=3))
#  mm <- as.matrix(r3)
#  mm[is.na(mm)]<-0
#  mnist.test[i, -1] <- as.matrix(r3)
#}
```


```r
show_digit(as.matrix(mnist.train[1, -c(1:5)]), main = mnist.train[1, 1])
```

![plot of chunk unnamed-chunk-2](figure/unnamed-chunk-2-1.png) 

```r
show_digit(as.matrix(mnist.train[2, -c(1:5)]), main = mnist.train[2, 1])
```

![plot of chunk unnamed-chunk-2](figure/unnamed-chunk-2-2.png) 

```r
show_digit(as.matrix(mnist.train[11, -c(1:5)]), main = mnist.train[11, 1])
```

![plot of chunk unnamed-chunk-2](figure/unnamed-chunk-2-3.png) 

```r
#sds <- sapply(mnist.train, sd)
#zero.sd <- names(mnist.train)[sds < 2 ]
mnist.train.nz <- mnist.train #[, setdiff(names(mnist.train), zero.sd)]

#sds2 <- sapply(mnist.train.nz, sd)
#zero.sd2 <- names(mnist.train.nz)[sds2 < 2 ][-1]
#mnist.train.nz2 <- mnist.train.nz[, setdiff(names(mnist.train.nz), zero.sd2)]
#mnist.train.nz <- mnist.train.nz2 

#mnist.train.nz <- deskew(mnist.train.nz, mincol=3)

#sds2 <- sapply(mnist.train.nz, sd)
#zero.sd2 <- names(mnist.train.nz)[(sds2) <= 2]
#mnist.train.nz <- mnist.train.nz [, setdiff(names(mnist.train.nz), zero.sd2)]
```


```r
mnist.train.nz.jittered <- mnist.train.nz
mnist.train.nz.jittered[, -c(1:5)] <- apply(mnist.train.nz[, -c(1:5)], 2, jitter)

tn.lda <- tune(lda, y ~ ., data = mnist.train.nz,
               predict.func = predict.pcalda, tunecontrol = tune.control(cross = 3))
summary(tn.lda)
```

```
## 
## Error estimation of 'lda' using 3-fold cross validation: 0.103881
```

```r
table(actual = mnist.train$y, predicted = predict(tn.lda$best.model, mnist.train)$class)
```

```
##       predicted
## actual    0    1    2    3    4    5    6    7    8    9
##      0 5529    7   29   13   16   63  121    1  118   26
##      1    2 6311   22   42  145  160    9   36    4   11
##      2   70  198 4950  180   92   50  202   96  104   16
##      3   26  105   87 5404   11  190   14  184   56   54
##      4    4  117   56    2 5236   35   91    8   26  267
##      5   52   75   14  335  124 4598   78   30   51   64
##      6   55   79   25    9   13   68 5614    0   53    2
##      7   10  124    7   17  120   29    0 5809    4  145
##      8   39  114   61   40   39  109   55    8 5230  156
##      9   24   44    9   49  209   28    1  124   74 5387
```

```r
tt <- table(actual = mnist.test$y, predicted = predict(tn.lda$best.model,
                                                       mnist.test)$class)
print(tt)
```

```
##       predicted
## actual    0    1    2    3    4    5    6    7    8    9
##      0  930    3    2    2    1   10   18    1    9    4
##      1    1 1082    4    0   18   18    5    4    1    2
##      2   19   35  855   46   13    6   20   22   13    3
##      3    3   12   11  912    1   27    3   32    4    5
##      4    1   24    6    0  880    2   18    0    2   49
##      5    8    8    4   55   19  761    6   11   12    8
##      6   11   11    5    2    1   15  902    0   11    0
##      7    1   22    2    6   15    7    0  952    1   22
##      8    5   16    7    3    7   13    8    3  883   29
##      9    8    6    3    7   38    8    0   13   17  909
```

```r
1 - sum(diag(tt))/sum(tt)
```

```
## [1] 0.0934
```


```r
#zero.sd <- names(mnist.train)[sds < 2]
#mnist.train.nz <- mnist.train[, setdiff(names(mnist.train), zero.sd)]
#mnist.train.nz<- deskew(mnist.train.nz, mincol=2)
pcaqda <- function(...) pcawrap(qda, ...)
predict.pcaqda <- function(...) predict(...)$class
```

```r
tn.qda <- tune(qda, y ~ ., data = mnist.train.nz.jittered,
               predict.func = predict.pcaqda,
               tunecontrol = tune.control(cross = 2))

summary(tn.qda)
```

```
## 
## Error estimation of 'qda' using 2-fold cross validation: 0.12805
```

```r
table(actual = mnist.train$y,
      predicted = predict(tn.qda$best.model)$class)
```

```
## Error in model.frame.default(train.x = y ~ ., data = mnist.train.nz.jittered, : invalid type (language) for variable '(train.x)'
```

```r
tt <- table(actual = mnist.test$y,
            predicted = predict(tn.qda$best.model, mnist.test)$class)
print(tt)
```

```
##       predicted
## actual    0    1    2    3    4    5    6    7    8    9
##      0  952    0    4    4    0    2    0    0   18    0
##      1    1 1064   11    0    6    1   12   11   28    1
##      2    8    2  974    9    4    0    3    2   27    3
##      3    9    2   27  882    0    8    1    1   66   14
##      4    3    4   20    1  761    1    6    4   12  170
##      5   10    2    2   49    0  771    6    0   45    7
##      6   29    4   13    2    4   14  868    0   24    0
##      7    1   27   44    3   24    1    0  775   28  125
##      8    9    1   16   19    4   16    0    1  889   19
##      9    7    8   15    7   28    0    0    9   33  902
```

```r
1 - sum(diag(tt)) / sum(tt)
```

```
## [1] 0.1162
```

```r
conn.comps <- levels(factor(mnist.train.nz[,"c"]))

pcaqda_array <- NULL
#digits <- levels(factor(mnist.train.nz[mnist.train.nz[, "c"] == conn.comps[6], ][, 1]))
#nrow(mnist.train.nz[ is.element(mnist.train.nz[, "y"], digits), ])
k<-1
for (i in 1 : length(conn.comps)) {
  digits <- levels(factor(mnist.train.nz[mnist.train.nz[, "c"] == conn.comps[i], ][, 1]))
  print(digits)
  #mnist.train.nz.filtered <- mnist.train.nz[ is.element(mnist.train.nz[, "y"], digits), ]
  mnist.train.nz.filtered <- mnist.train.nz[ mnist.train.nz[, "c"]==conn.comps[i], ]
  
  tn.pcaqda_temp <- tune(pcaqda, y ~ .-c, data = mnist.train.nz.filtered,
                  scale = FALSE, center = TRUE,# ranges = list(ncomp = c(1, 10, 20, 40, 50)),
                  ranges = list(ncomp = c(10, 30, 35, 40, 50, 70, 90)),
                  predict.func = predict.pcaqda,
                  tunecontrol = tune.control(cross = 3))
  #print(tn.pcaqda_temp)
  if (!is.null(tn.pcaqda_temp)) {
    pcaqda_array <- cbind(pcaqda_array, tn.pcaqda_temp)
    colnames(pcaqda_array)[k] <- conn.comps[i]
    k<- k+1
  }

}
```

```
##  [1] "0" "1" "2" "3" "4" "5" "6" "7" "8" "9"
##  [1] "0" "1" "2" "3" "4" "5" "6" "7" "8" "9"
```

```
## Error in qda.default(x, grouping, ...): some group is too small for 'qda'
```

```r
print(ncol(pcaqda_array))
```

```
## [1] 1
```

```r
print(conn.comps)
```

```
## [1] "1" "2" "3" "4" "5" "6"
```

```r
tn.pcaqda <- tune(pcaqda, y ~ ., data = mnist.train.nz,
                  scale = FALSE, center = TRUE,# ranges = list(ncomp = c(1, 10, 20, 40, 50)),
                  ranges = list(ncomp = c(10, 30, 35, 40, 50, 70, 90)),
                  predict.func = predict.pcaqda,
                  tunecontrol = tune.control(cross = 3))

#summary(tn.pcaqda)
#method returns set of predicted values for given input set
print("in predict")
```

```
## [1] "in predict"
```

```r
predict_filtered <- function(mnist.test) {
  test.set.conn <- levels(factor(mnist.test[, "c"]))
  #print(test.set.conn)
  results <- vector(mode="integer", length = nrow(mnist.test))
  for (i in 1: length(test.set.conn)) {
    subset <- mnist.test[mnist.test[, "c"] == test.set.conn[i], ]
    if (is.element(test.set.conn[i], colnames(pcaqda_array))) {
      #print(predict(pcaqda_array[, test.set.conn[i]]$best.model, subset))
      results[mnist.test[, "c"] == test.set.conn[i]] <- predict(pcaqda_array[, test.set.conn[i]]$best.model, subset)$class
    } else {
      results[mnist.test[, "c"] == test.set.conn[i]] <- predict(tn.pcaqda$best.model, subset)$class
    }
  }
  results
}
#plot(tn.pcaqda)

table(actual = mnist.train$y,
      predicted = predict_filtered(mnist.train))
```

```
##       predicted
## actual    1    2    3    4    5    6    7    8    9   10
##      0 5795    7   41    6    4   27    3    0   40    0
##      1    0 6363   95   17   27    2   18   55  145   20
##      2   13    3 5850   28   18    1    3    6   30    6
##      3    2    0   59 5916    7   49    0   16   68   14
##      4    9    4   34    1 5626    2   15   12   42   97
##      5   11    0    6  130    2 5191   14    0   56   11
##      6   25    8   17    2    9   92 5708    0   57    0
##      7   13    5   97   18   45    6    0 5893   67  121
##      8    8   29   53   47   11   44    4    4 5616   35
##      9    9    6   38   70   83    9    1   78  109 5546
```

```r
tt <- table(actual = mnist.test$y,
            predicted = predict_filtered(mnist.test))
print(tt)
```

```
##       predicted
## actual    1    2    3    4    5    6    7    8    9   10
##      0  961    0    6    0    0    5    0    0    8    0
##      1    0 1085   11    1    3    1    6    7   19    2
##      2    2    0 1013    8    2    0    0    2    5    0
##      3    1    0    5  988    0    7    0    0    9    0
##      4    1    0    6    0  949    0    4    1   10   11
##      5    3    0    2   34    0  846    1    0    5    1
##      6    5    3    6    0    3   16  916    0    9    0
##      7    0    2   31    4    7    2    0  948   14   20
##      8    2    0    7    7    2    9    0    1  941    5
##      9    1    3   10    6   16    5    0   12   22  934
```

```r
1 - sum(diag(tt)) / sum(tt)
```

```
## [1] 0.0419
```


```r
prs <- by(mnist.train, mnist.train$y, function(df) {
  pr <- prcomp(~. - y, data = df, scale = FALSE,
               center = TRUE, ncomp = 3)
})
show_digit(prs[["0"]]$rotation[, 1])
```

![plot of chunk unnamed-chunk-7](figure/unnamed-chunk-7-1.png) 

```r
show_digit(prs[["1"]]$rotation[, 1])
```

![plot of chunk unnamed-chunk-7](figure/unnamed-chunk-7-2.png) 

```r
show_digit(prs[["3"]]$rotation[, 1])
```

![plot of chunk unnamed-chunk-7](figure/unnamed-chunk-7-3.png) 

```r
show_digit(prs[["4"]]$rotation[, 1])
```

![plot of chunk unnamed-chunk-7](figure/unnamed-chunk-7-4.png) 

```r
show_digit(prs[["7"]]$rotation[, 1])
```

![plot of chunk unnamed-chunk-7](figure/unnamed-chunk-7-5.png) 
