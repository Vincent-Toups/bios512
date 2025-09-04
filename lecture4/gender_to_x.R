gender_to_x <- function(g){
  x <- c("male" = 1, "female" = -1)
  x[g]
}

