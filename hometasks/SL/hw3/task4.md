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
stepCV(l, trace = TRUE, direction="backward")
```

```
## Start:  CV.performance=2.95
## Sales ~ TV + Radio + Newspaper
## 
##                     Df rank      CV
## - TV        -15.919825    3 18.8590
## - Radio      -7.107173    3 10.0463
## <none>                    4  2.9391
## - Newspaper   0.035548    3  2.9036
## 
## Step:  CV.performance=18.67
## Sales ~ Radio + Newspaper
## 
##                    Df rank     CV
## - Radio     -7.603313    2 26.125
## <none>                   3 18.522
## - Newspaper  0.040492    2 18.481
## 
## Step:  CV.performance=26.29
## Sales ~ Newspaper
## 
##                 Df rank     CV
## <none>                2 26.453
## - Newspaper 26.453    1  0.000
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
stepCV((lm(Sales~1, Advertising)), trace = TRUE, direction="forward", scope=Sales~I(Radio*Newspaper) + Radio + TV )
```

```
## Start:  CV.performance=0
## Sales ~ 1
## 
##                             Df rank     CV
## + I(Radio * Newspaper) -23.175    2 23.175
## + Radio                -18.663    2 18.663
## + TV                   -10.760    2 10.760
## <none>                            1  0.000
## 
## Step:  CV.performance=23.04
## Sales ~ I(Radio * Newspaper)
## 
##              Df rank      CV
## <none>             2 23.0136
## + Radio  3.4019    3 19.6117
## + TV    16.1870    3  6.8267
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
stepCV((lm(Sales~TV+Radio, Advertising)), trace = TRUE, direction="both", scope=list(lower=Sales~1, upper=Sales~I(Radio*Newspaper) + Radio + TV))$anova
```

```
## Start:  CV.performance=2.85
## Sales ~ TV + Radio
## 
##                                Df rank      CV
## - TV                   -15.695533    2 18.6138
## - Radio                 -8.033049    2 10.9513
## + I(Radio * Newspaper)  -0.025309    4  2.9713
## <none>                               3  2.9183
## 
## Step:  CV.performance=18.23
## Sales ~ Radio
## 
##                              Df rank      CV
## + I(Radio * Newspaper) -0.37409    3 18.8667
## <none>                             2 18.7553
## + TV                   15.62982    3  2.8628
## - Radio                18.75534    1  0.0000
## 
## Step:  CV.performance=19.17
## Sales ~ Radio + I(Radio * Newspaper)
## 
##                             Df rank      CV
## - Radio                -3.7722    2 22.6757
## <none>                            3 18.9035
## - I(Radio * Newspaper)  0.3772    2 18.5263
## + TV                   16.0099    4  3.0819
## 
## Step:  CV.performance=22.88
## Sales ~ I(Radio * Newspaper)
## 
##                             Df rank      CV
## <none>                            2 23.3504
## + Radio                 4.1621    3 18.9031
## + TV                   15.9881    3  7.0771
## - I(Radio * Newspaper) 23.3504    1  0.0000
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
## 1                           2.845712    3  2.845712
## 2                   - TV   18.230915    2 18.230915
## 3 + I(Radio * Newspaper)   19.168760    3 19.168760
## 4                - Radio   22.875072    2 22.875072
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

