Задание 1.4.(stepCV)
========================================================
Задание 1.4. Написать на R функцию stepCV, аналогичную stepAIC, но использующую кросс-валидацию для проверки значимости признака. Нужно следовать при этом принципу иерархии — нельзя выкидывать признаки более низкого порядка, если есть признаки более высокого. Функция должна работать со всеми методами, с которыми работает stepAIC.

Hint: Можно расковырять оригинальную функцию stepAIC, а кросс-валидацию взять из e1071.


```r
library(MASS)
library(e1071)
library(rmarkdown)
```


```r
source("stepCV.R")
```

Пример посложнее


```r
Advertising <- read.csv("data/Advertising.csv")
l <- lm(Sales~. , Advertising)
stepCV(l, trace = TRUE)
```

```
## Start:  CV.performance=3.06
## Sales ~ X + TV + Radio + Newspaper
## 
##                     Df rank      CV
## - TV        -15.855293    4 18.7673
## - Radio      -7.030925    4  9.9429
## - X          -0.049747    4  2.9618
## <none>                    5  2.9120
## - Newspaper   0.022077    4  2.8899
## 
## Step:  CV.performance=19.22
## Sales ~ X + Radio + Newspaper
## 
##                    Df rank     CV
## - Radio     -7.502128    3 26.322
## <none>                   4 18.819
## - Newspaper  0.051988    3 18.767
## - X          0.359721    3 18.460
## 
## Step:  CV.performance=27.09
## Sales ~ X + Newspaper
## 
##                   Df rank     CV
## - Newspaper -0.57776    2 27.493
## <none>                  3 26.915
## - X          0.62277    2 26.292
```

```
## 
## Call:
## lm(formula = Sales ~ X + Newspaper, data = Advertising)
## 
## Coefficients:
## (Intercept)            X    Newspaper  
##    12.52105     -0.00150      0.05408
```

Можно сравнить результат с stepAIC:

```r
stepAIC(l, trace = TRUE)
```

```
## Start:  AIC=214.71
## Sales ~ X + TV + Radio + Newspaper
## 
##             Df Sum of Sq    RSS    AIC
## - Newspaper  1      0.13  556.7 212.75
## - X          1      0.22  556.8 212.79
## <none>                    556.6 214.71
## - Radio      1   1354.48 1911.1 459.42
## - TV         1   3056.91 3613.5 586.82
## 
## Step:  AIC=212.75
## Sales ~ X + TV + Radio
## 
##         Df Sum of Sq    RSS    AIC
## - X      1      0.18  556.9 210.82
## <none>                556.7 212.75
## - Radio  1   1522.57 2079.3 474.29
## - TV     1   3060.94 3617.7 585.05
## 
## Step:  AIC=210.82
## Sales ~ TV + Radio
## 
##         Df Sum of Sq    RSS    AIC
## <none>                556.9 210.82
## - Radio  1    1545.6 2102.5 474.52
## - TV     1    3061.6 3618.5 583.10
```

```
## 
## Call:
## lm(formula = Sales ~ TV + Radio, data = Advertising)
## 
## Coefficients:
## (Intercept)           TV        Radio  
##     2.92110      0.04575      0.18799
```

Результаты получаются разные (Sales~X + Newspaper при вызове stepCV, при вызове stepAIC - другой результат)
