Задание 1.4.(stepCV)
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

Пример посложнее


```r
Advertising <- read.csv("data/Advertising.csv")[, - c(1)]
l <- lm(Sales~. , Advertising)
stepCV(l, trace = TRUE, direction="backward", data = Advertising)
```

```
## Start:  CV.performance=2.95
## Sales ~ TV + Radio + Newspaper
## 
##                     Df rank      CV
## - TV        -15.880674    3 18.7643
## - Radio      -6.968705    3  9.8523
## - Newspaper  -0.085503    3  2.9691
## <none>                    4  2.8836
## 
## Step:  CV.performance=19.27
## Sales ~ Radio + Newspaper
## 
##                   Df rank     CV
## - Radio     -7.81900    2 26.381
## - Newspaper -0.28481    2 18.846
## <none>                  3 18.562
## 
## Step:  CV.performance=26.31
## Sales ~ Newspaper
## 
##                 Df rank     CV
## <none>                2 26.343
## - Newspaper 26.343    1  0.000
```

```
## 
## Call:
## lm(formula = Sales ~ Newspaper, data = Advertising)
## 
## Coefficients:
## (Intercept)    Newspaper  
##    12.35141      0.05469
```

```r
stepCV((lm(Sales~1, Advertising)), trace = TRUE, direction="forward", scope=Sales~I(Radio*Newspaper) + Radio + TV, data = Advertising )
```

```
## Start:  CV.performance=0
## Sales ~ 1
## 
##                             Df rank     CV
## + I(Radio * Newspaper) -22.988    2 22.988
## + Radio                -18.335    2 18.335
## + TV                   -10.829    2 10.829
## <none>                            1  0.000
## 
## Step:  CV.performance=23.06
## Sales ~ I(Radio * Newspaper)
## 
##              Df rank      CV
## <none>             2 23.0699
## + Radio  3.9288    3 19.1411
## + TV    16.2736    3  6.7963
```

```
## 
## Call:
## lm(formula = Sales ~ I(Radio * Newspaper), data = Advertising)
## 
## Coefficients:
##          (Intercept)  I(Radio * Newspaper)  
##            12.114256              0.002314
```

```r
stepCV((lm(Sales~TV+Radio, Advertising)), trace = TRUE, direction="both", scope=list(lower=Sales~1, upper=Sales~I(Radio*Newspaper) + Radio + TV), data = Advertising)$anova
```

```
## Start:  CV.performance=2.88
## Sales ~ TV + Radio
## 
##                                Df rank      CV
## - TV                   -15.513795    2 18.3865
## - Radio                 -7.910542    2 10.7832
## + I(Radio * Newspaper)   0.026471    4  2.9702
## <none>                               3  2.8727
## 
## Step:  CV.performance=18.44
## Sales ~ Radio
## 
##                              Df rank      CV
## + I(Radio * Newspaper) -0.45779    3 18.9446
## <none>                             2 18.3045
## + TV                   15.53938    3  2.9474
## - Radio                18.30451    1  0.0000
## 
## Step:  CV.performance=19.33
## Sales ~ Radio + I(Radio * Newspaper)
## 
##                              Df rank      CV
## - Radio                -4.66810    2 23.5180
## <none>                             3 18.8499
## - I(Radio * Newspaper)  0.50387    2 18.3460
## + TV                   15.79309    4  2.9926
## 
## Step:  CV.performance=22.88
## Sales ~ I(Radio * Newspaper)
## 
##                            Df rank      CV
## <none>                           2 22.8902
## + Radio                 3.748    3 18.8672
## + TV                   15.744    3  6.8711
## - I(Radio * Newspaper) 22.890    1  0.0000
```

```
## Stepwise Model Path 
## Analysis of Deviance Table
## 
## Initial Model:
## Sales ~ TV + Radio
## 
## Final Model:
## Sales ~ I(Radio * Newspaper)
## 
## 
##                     Step performance rank        CV
## 1                           2.884226    3  2.884226
## 2                   - TV   18.439401    2 18.439401
## 3 + I(Radio * Newspaper)   19.327842    3 19.327842
## 4                - Radio   22.880074    2 22.880074
```

Можно сравнить результат с stepAIC:

```r
stepAIC(l, trace = TRUE)
```

```
## Start:  AIC=212.79
## Sales ~ TV + Radio + Newspaper
## 
##             Df Sum of Sq    RSS    AIC
## - Newspaper  1      0.09  556.9 210.82
## <none>                    556.8 212.79
## - Radio      1   1361.74 1918.6 458.20
## - TV         1   3058.01 3614.8 584.90
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

Результаты получаются разные.

