# from file MASS/R/add.R
# dropterm method redefined
addterm2 <-
  function(object, ...) UseMethod("addterm2")

addterm2.default <-
  function(object, scope, scale = 0, test = c("none"),
           k = 2, sorted = FALSE, trace = FALSE, data, ...)
  {
    if(missing(scope) || is.null(scope)) stop("no terms in scope")
    if(!is.character(scope))
      scope <- add.scope(object, update.formula(object, scope))
    if(!length(scope))
      stop("no terms in scope for adding to object")
    ns <- length(scope)
    ans <- matrix(nrow = ns + 1L, ncol = 2L,
                  dimnames = list(c("<none>", scope), c("rank", "performance")))
    ans[1L,  ] <- extractCV(object, data, scale, k = k, ...)
    n0 <- nobs(object, use.fallback = TRUE)
    env <- environment(formula(object))
    for(i in seq_len(ns)) {
      tt <- scope[i]
      if(trace) {
        message(gettextf("trying + %s", tt), domain = NA)
        utils::flush.console()
      }
      nfit <- update(object, as.formula(paste("~ . +", tt)),
                     evaluate = FALSE)
      nfit <- try(eval(nfit, envir = env), silent = TRUE)
      ans[i + 1L, ] <- if (!inherits(nfit, "try-error")) {
        nnew <- nobs(nfit, use.fallback = TRUE)
        if (all(is.finite(c(n0, nnew))) && nnew != n0)
          stop("number of rows in use has changed: remove missing values?")
        extractCV(nfit, data, scale, k = k, ...)
      } else NA_real_
    }
    dfs <- ans[1L , 2L] - ans[, 2L]
    dfs <- ans[1L, 2L] - ans[, 2L]
    dfs[1L] <- NA
    aod <- data.frame(Df = dfs, rank = ans[, 1L], CV = ans[, 2L])
    o <- if(sorted) order(aod$CV) else seq_along(aod$CV)
    aod <- aod[o, ]
    head <- c("Single term additions", "\nModel:", deparse(formula(object)))
    if(scale > 0)
      head <- c(head, paste("\nscale: ", format(scale), "\n"))
    class(aod) <- c("anova", "data.frame")
    attr(aod, "heading") <- head
    aod
  }

dropterm2 <- function(object, ...) UseMethod("dropterm2")

dropterm2.default <- function(object, scope, scale = 0, test = c("none"),
           k = 2, sorted = FALSE, trace = FALSE, data=NULL, ...) {
    tl <- attr(terms(object), "term.labels")
    if(missing(scope)) scope <- drop.scope(object)
    else {
      if(!is.character(scope))
        scope <- attr(terms(update.formula(object, scope)), "term.labels")
      if(!all(match(scope, tl, 0L)))
        stop("scope is not a subset of term labels")
    }
    ns <- length(scope)
    ans <- matrix(nrow = ns + 1L, ncol = 2L,
                  dimnames =  list(c("<none>", scope), c("rank", "performance")))
    
    ans[1,  ] <- extractCV(object, data, scale, k = k, ...)
    n0 <- nobs(object, use.fallback = TRUE)
    env <- environment(formula(object))
    for(i in seq_len(ns)) {
      tt <- scope[i]
      if(trace) {
        message(gettextf("trying - %s", tt), domain = NA)
        utils::flush.console()
      }
      nfit <- update(object, as.formula(paste("~ . -", tt)),
                     evaluate = FALSE)
      nfit <- eval(nfit, envir=env) # was  eval.parent(nfit)
      ans[i+1, ] <- extractCV(nfit, data, scale, k = k, ...)
      nnew <- nobs(nfit, use.fallback = TRUE)
      if(all(is.finite(c(n0, nnew))) && nnew != n0)
        stop("number of rows in use has changed: remove missing values?")
    }
    dfs <- ans[1L , 2L] - ans[, 2L]
    dfs[1L] <- NA
    aod <- data.frame(Df = dfs, rank=ans[, 1], CV = ans[,2])
    o <- if(sorted) order(aod$CV) else seq_along(aod$CV)
    test <- match.arg(test)
    aod <- aod[o, ]
    head <- c("Single term deletions", "\nModel:", deparse(formula(object)))
    if(scale > 0)
      head <- c(head, paste("\nscale: ", format(scale), "\n"))
    class(aod) <- c("anova", "data.frame")

    attr(aod, "heading") <- head
    aod
  }
# modified file MASS/R/stepAIC.R
#
stepCV <- function(object, scope, scale = 0,
           direction = c("both", "backward", "forward"),
           trace = 1, keep = NULL, steps = 1000, use.start = FALSE, k = 2,  
           data = NULL, ...)
{
    cut.string <- function(string) {
        if(length(string) > 1L)
            string[-1L] <- paste("\n", string[-1L], sep = "")
        string
    }

    re.arrange <- function(keep) {
        namr <- names(k1 <- keep[[1L]])
        namc <- names(keep)
        nc <- length(keep)
        nr <- length(k1)
        array(unlist(keep, recursive = FALSE), c(nr, nc), list(namr, namc))
    }

    step.results <- function(models, fit, object, usingCp=FALSE) {
        change <- sapply(models, "[[", "change")
        rank <- sapply(models, "[[", "rank")
        performance <- sapply(models, "[[", "performance")
        ddf <- c(NA, abs(diff(performance)))
        CV <- sapply(models, "[[", "CV")
        heading <- c("Stepwise Model Path \nAnalysis of Deviance Table",
                     "\nInitial Model:", deparse(formula(object)),
                     "\nFinal Model:", deparse(formula(fit)),
                     "\n")
        aod <-
            if(usingCp)
                data.frame(Step = change, performance = performance, rank = rank,
                           Cp = CV, check.names = FALSE)
            else data.frame(Step = change, performance = performance, rank = rank,
                            CV = CV, check.names = FALSE)
        attr(aod, "heading") <- heading
        class(aod) <- c("Anova", "data.frame")
        fit$anova <- aod
        fit
    }

    Terms <- terms(object)
    object$formula <- Terms
    if(inherits(object, "lme")) object$call$fixed <- Terms
    else if(inherits(object, "gls")) object$call$model <- Terms
    else object$call$formula <- Terms
    if(use.start) warning("'use.start' cannot be used with R's version of 'glm'")
    md <- missing(direction)
    direction <- match.arg(direction)
    backward <- direction == "both" | direction == "backward"
    forward <- direction == "both" | direction == "forward"
    if(missing(scope)) {
	      fdrop <- numeric()
        fadd <- attr(Terms, "factors")
        if(md) forward <- FALSE
    } else {
        if(is.list(scope)) {
            fdrop <- if(!is.null(fdrop <- scope$lower))
                attr(terms(update.formula(object, fdrop)), "factors")
            else numeric()
            fadd <- if(!is.null(fadd <- scope$upper))
                attr(terms(update.formula(object, fadd)), "factors")
        } else {
            fadd <- if(!is.null(fadd <- scope))
                attr(terms(update.formula(object, scope)), "factors")
            fdrop <- numeric()
        }
    }
    models <- vector("list", steps)
    if(!is.null(keep)) keep.list <- vector("list", steps)
    n <- nobs(object, use.fallback = TRUE)  # might be NA
    fit <- object
    resCV <- extractCV(fit, data, scale, k = k, ...)
    rank <- resCV[1L]
	  performance <- resCV[2L]
    if(is.na(performance))
        stop("performance is not defined for this model, so 'stepCV' cannot proceed")
    if(performance == -Inf)
        stop("performance is -infinity for this model, so 'stepCV' cannot proceed")
   nm <- 1
    Terms <- terms(fit)
    if(trace) {
        cat("Start:  CV.performance=", format(round(performance, 2)), "\n",
            cut.string(deparse(formula(fit))), "\n\n", sep='')
	utils::flush.console()
    }
	  models[[nm]] <- list(rank = rank, change = "", performance = performance, CV=performance)
    if(!is.null(keep)) keep.list[[nm]] <- keep(fit, performance)
    usingCp <- FALSE
    while(steps > 0) {
        steps <- steps - 1
        CV <- performance
        ffac <- attr(Terms, "factors")
        ## don't drop strata terms
        if(!is.null(sp <- attr(Terms, "specials")) &&
           !is.null(st <- sp$strata)) ffac <- ffac[-st,]
        scope <- factor.scope(ffac, list(add = fadd, drop = fdrop))
        aod <- NULL
        change <- NULL
        if(backward && length(scope$drop)) {
            aod <- dropterm2(fit, scope$drop, scale = scale,
                            trace = max(0, trace - 1), k = k, data=data, ...)
            rn <- row.names(aod)
            row.names(aod) <- c(rn[1L], paste("-", rn[-1L], sep=" "))
            ## drop all zero df terms first.
            if(any(aod$Df == 0, na.rm=TRUE)) {
                zdf <- aod$Df == 0 & !is.na(aod$Df)
                nc <- match(c("Cp", "CV"), names(aod))
                nc <- nc[!is.na(nc)][1L]
                ch <- abs(aod[zdf, nc] - aod[1, nc]) > 0.01
                if(any(is.finite(ch) & ch)) {
                    warning("0 df terms are changing CV")
                    zdf <- zdf[!ch]
                }
                ## drop zero df terms first: one at time since they
                ## may mask each other
                if(length(zdf) > 0L)
                    change <- rev(rownames(aod)[zdf])[1L]
            }
        }
        if(is.null(change)) {
            if(forward && length(scope$add)) {
                aodf <- addterm2(fit, data = data, scope$add, scale = scale,
                                trace = max(0, trace - 1), k = k, ...)
                rn <- row.names(aodf)
                row.names(aodf) <- c(rn[1L], paste("+", rn[-1L], sep=" "))
                aod <-
                    if(is.null(aod)) aodf
                    else rbind(aod, aodf[-1, , drop=FALSE])
            }
            attr(aod, "heading") <- NULL
            if(is.null(aod) || ncol(aod) == 0) break
            ## need to remove any terms with zero df from consideration
            nzdf <- if(!is.null(aod$Df)) aod$Df != 0 | is.na(aod$Df)
            aod <- aod[nzdf, ]
            if(is.null(aod) || ncol(aod) == 0) break
            nc <- match(c("Cp", "CV"), names(aod))
            nc <- nc[!is.na(nc)][1L]
            o <- order(aod[, nc], decreasing =TRUE)
            if(trace) {
          		print(aod[o,  ])
          		utils::flush.console()
          	    }
            if (is.na(abs(aod[o,  ]$Df[1]))) break
            if (aod[o,  ]$Df[1] > -0.1) break
            if(o[1L] == 1) break
            change <- rownames(aod)[o[1L]]
        }
        usingCp <- match("Cp", names(aod), 0) > 0
        ## may need to look for a 'data' argument in parent
	fit <- update(fit, paste("~ .", change), evaluate = FALSE)
        fit <- eval.parent(fit)
        nnew <- nobs(fit, use.fallback = TRUE)
        if(all(is.finite(c(n, nnew))) && nnew != n)
            stop("number of rows in use has changed: remove missing values?")
        Terms <- terms(fit)
        resCV <- extractCV(fit, data, scale, k = k, ...)# was bAIC
        
        rank <- resCV[1L]
        performance <- resCV[2L]
        if(trace) {
            cat("\nStep:  CV.performance=", format(round(performance, 2)), "\n",
                cut.string(deparse(formula(fit))), "\n\n", sep='')
	    utils::flush.console()
	}
        ## add a tolerance as dropping 0-df terms might increase AIC slightly
      	if (is.na(aod[o,  ]$Df[1])) break
      	if (aod[o,  ]$Df[1] > -0.1) break
        nm <- nm + 1
        models[[nm]] <-
            list(rank = rank, performance=performance,
                 change = change, CV = performance)
        if(!is.null(keep)) keep.list[[nm]] <- keep(fit, performance)
    }
    if(!is.null(keep)) fit$keep <- re.arrange(keep.list[seq(nm)])
    step.results(models = models[seq(nm)], fit, object, usingCp)
}

extractCV <- function(object, ...) UseMethod("extractCV")

extractCV.lm <- function(fit, model, scale, k = 2, ...) {
  if (length(attr(fit$terms, "factors")) > 0) {
    t <- tune(lm, formula(fit$terms), data = model)
    c(t$best.model$rank, t$best.performance)
  } else {
    c(attr(fit$terms, "response"), 0)
  }
}

terms.gls <- terms.lme <- function(x, ...) terms(formula(x), ...)
