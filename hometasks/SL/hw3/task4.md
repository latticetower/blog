Title
========================================================
Задание 1.4. Написать на R функцию stepCV, аналогичную stepAIC, но использующую кросс-валидацию для проверки значимости признака. Нужно следовать при этом принципу иерархии — нельзя выкидывать признаки более низкого порядка, если есть признаки более высокого. Функция должна работать со всеми методами, с которыми работает stepAIC.

Hint: Можно расковырять оригинальную функцию stepAIC, а кросс-валидацию взять из e1071.


```r
library(MASS)
library(e1071)
```


```r
source("stepCV.R")
```

Пример


```r
l <- lm(y~. , epil)
stepCV(l, trace = TRUE)
```

```
## Start:  CV.performance=64.32
## y ~ trt + base + age + V4 + subject + period + lbase + lage
## 
##                  Df rank      CV
## - base    -40.80114    8 103.797
## - lbase    -5.87600    8  68.872
## - subject  -1.12091    8  64.117
## <none>                 9  62.996
## - V4        0.21232    8  62.783
## - lage      0.86694    8  62.129
## - age       1.00570    8  61.990
## - trt       1.36480    8  61.631
## - period    2.90006    8  60.096
## 
## Step:  CV.performance=105.16
## y ~ trt + age + V4 + subject + period + lbase + lage
```

```
## 
## Call:
## lm(formula = y ~ trt + age + V4 + subject + period + lbase + 
##     lage, data = epil)
## 
## Coefficients:
##  (Intercept)  trtprogabide           age            V4       subject  
##     39.77134      -3.11864      -1.09672      -0.72316       0.06868  
##       period         lbase          lage  
##     -0.27119      10.24944      33.40300
```

Можно сравнить результат с stepAIC:

```r
stepAIC(l, trace = TRUE)
```

```
## Start:  AIC=963.38
## y ~ trt + base + age + V4 + subject + period + lbase + lage
## 
##           Df Sum of Sq   RSS     AIC
## - period   1       8.7 12969  961.53
## - V4       1       9.3 12970  961.54
## - age      1      67.3 13028  962.60
## - trt      1     103.7 13064  963.26
## - lage     1     104.4 13065  963.27
## <none>                 12960  963.38
## - subject  1     132.8 13093  963.78
## - lbase    1    1376.2 14337  985.19
## - base     1    9300.0 22260 1089.03
## 
## Step:  AIC=961.53
## y ~ trt + base + age + V4 + subject + lbase + lage
## 
##           Df Sum of Sq   RSS     AIC
## - age      1      67.3 13036  960.76
## - V4       1      70.9 13040  960.82
## - trt      1     103.7 13073  961.41
## - lage     1     104.4 13074  961.43
## <none>                 12969  961.53
## - subject  1     132.8 13102  961.94
## - lbase    1    1376.2 14345  983.34
## - base     1    9300.0 22269 1087.12
## 
## Step:  AIC=960.76
## y ~ trt + base + V4 + subject + lbase + lage
## 
##           Df Sum of Sq   RSS     AIC
## - V4       1      70.9 13107  960.04
## <none>                 13036  960.76
## - trt      1     111.8 13148  960.77
## - subject  1     130.0 13166  961.10
## - lage     1     329.4 13366  964.64
## - lbase    1    1431.0 14468  983.34
## - base     1    9368.6 22405 1086.56
## 
## Step:  AIC=960.04
## y ~ trt + base + subject + lbase + lage
## 
##           Df Sum of Sq   RSS     AIC
## <none>                 13107  960.04
## - trt      1     111.8 13219  960.04
## - subject  1     130.0 13237  960.37
## - lage     1     329.4 13437  963.89
## - lbase    1    1431.0 14538  982.49
## - base     1    9368.6 22476 1085.30
```

```
## 
## Call:
## lm(formula = y ~ trt + base + subject + lbase + lage, data = epil)
## 
## Coefficients:
##  (Intercept)  trtprogabide          base       subject         lbase  
##     -10.2977       -2.7702        0.5570        0.0873       -7.7688  
##         lage  
##       5.4846
```
