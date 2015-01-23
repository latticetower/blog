library(svd)
logweightsplot <- function(pc, ncomp = 50,
                           ...) {
  w <- colSums(pc$x^2)
  w <- w[seq_len(min(ncomp, length(w)))]
  xyplot(log(w) ~ seq_along(w), ...)
}
cumweightsplot <- function(pc, ncomp = 50,
                           ...) {
  w <- colSums(pc$x^2)
  w <- w/sum(w)
  w <- w[seq_len(min(ncomp, length(w)))]
  xyplot(cumsum(w) ~ seq_along(w), ...)
}
pcawrap <- function(learner, x, data = NULL,
                    subset = NULL, ..., ncomp, center = TRUE,
                    scale = TRUE) {
  if (is.null(data))
    data <- parent.frame()
  mf <- model.frame(x, data = data)
  if (!is.null(subset))
    mf <- mf[subset, ]
  response <- mf[, 1]
  predictors <- mf[, -1, drop = FALSE]
  pca <- prcomp(predictors, scale = scale,
                center = center, ncomp = ncomp)
  pca.data <- as.data.frame(predict(pca)[,
                                         seq_len(ncomp), drop = FALSE], predictors)
  pca.data$response <- response
  model <- learner(response ~ ., data = pca.data,
                   ...)
  res <- list(pca = pca, model = model,
              formula = x, data = data, terms = attr(mf,
                                                     "terms"), ncomp = ncomp)
  class(res) <- "pcawrap"
  res
}
predict.pcawrap <- function(object, newdata = object$data,
                            ...) {
  mf <- model.frame(delete.response(object$terms),
                    data = newdata)
  predictors <- as.data.frame(predict(object$pca,
                                      mf)[, seq_len(object$ncomp), drop = FALSE])
  predict(object$model, newdata = predictors,
          ...)
}
prcomp.default <- function(x, retx = TRUE,
                           center = TRUE, scale. = FALSE, tol = NULL,
                           ncomp = 50, use.robust.scaling = FALSE,
                           use.robust.cov = FALSE, ...) {
  scale.mm <- function(x, center = TRUE,
                       scale = TRUE) {
    if (isTRUE(center))
      center <- apply(x, 2, median)
    if (isTRUE(scale))
      scale <- apply(x, 2, mad)
    base::scale(x, center = center, scale = scale)
  }
  x <- as.matrix(x)
  if (use.robust.scaling) {
    x <- scale.mm(x, center = center,
                  scale = scale.)
  } else {
    x <- scale(x, center = center, scale = scale.)
  }
  cen <- attr(x, "scaled:center")
  sc <- attr(x, "scaled:scale")
  if (any(sc == 0))
    stop("cannot rescale a constant/zero column to unit variance")
  if (!use.robust.cov) {
    if (min(dim(x)) < 50) {
      s <- svd(x, nu = 0, nv = ncomp)
    } else {
      require("svd")
      s <- propack.svd(x, neig = ncomp)
    }
  } else {
    cov <- MASS::cov.rob(x)$cov
    if (ncol(cov) > 50) {
      v <- trlan.eigen(cov, neig = ncomp)$u
    } else {
      v <- eigen(cov, symmetric = TRUE)$vectors
    }
    d <- sqrt(colSums((x %*% v)^2))
    s <- list(d = d, v = v)
  }
  s$d <- s$d/sqrt(max(1, nrow(x) - 1))
  if (!is.null(tol)) {
    rank <- sum(s$d > (s$d[1L] * tol))
    if (rank < ncol(x)) {
      s$v <- s$v[, 1L:rank, drop = FALSE]
      s$d <- s$d[1L:rank]
    }
  }
  dimnames(s$v) <- list(colnames(x), paste0("PC",
                                            seq_len(ncol(s$v))))
  r <- list(sdev = s$d, rotation = s$v,
            center = if (is.null(cen)) FALSE else cen,
            scale = if (is.null(sc)) FALSE else sc)
  if (retx)
    r$x <- x %*% s$v
  class(r) <- "prcomp"
  r
}
unlockBinding("prcomp.default", env = loadNamespace("stats"))
assign("prcomp.default", prcomp.default,
       envir = loadNamespace("stats"))
lockBinding("prcomp.default", env = loadNamespace("stats"))

