Joins
=====

They are called joins because they join data from multiple tables.

Definitions:
------------

1. table: a data structure with some columns (usually named) and some rows.
2. observation: one item of interest (often one row, but not always)
3. key: a column or columns (almost always unique) which identifies an observation
4. join: the process of combining tables (almost always using keys)
5. query: a program which uses some tables, joins, filters, subsets columns,
   creates new columns, and returns a new table
6. relational data(base): a collection of tables organized along the above lines
7. pivot: when we change our notion of observation we "pivot" our data so that
   we have one row per observation.

All we have to do to understand joins is just think carefully about all the ways 
we might want to put data together.

Logically, I want to talk about pivots first, though.

Pivots
------

Again, if we first understand that we want _one observation per row_ then pivots
make sense.  

Consider our original table:

:table:source_data/frat_boys_basic.csv::

The observation here is one person per row. But what if someone approached you
and asked "How much information do we have about each student in this data set?"

In that case a single observation is "a student and a recording of some data."

From that point of view, multiple observations occur on each row of our basic data
set and we want to *pivot* to a different conception of an observation.

```sidebar
Nota bene: You often see people name variables `df` or `data.` Even I do it. This
is ok for quick demonstrations but there is something to consider - short
variable names don't convey much information and they sometimes overlap with 
functions defined in the global scope (both df and data have this issue) which can
cause confusing errors. It is usually good to give concise but informative names.
```

```R 
library(tidyverse)

students <- read_csv("source_data/frat_boys_basic.csv")

# note we pivot _longer_ because we need more rows for our observations
student_data <- pivot_longer(students, fraternity:dietary_preference)

mddf(student_data)



```
We got an error - this is an example of a type failure. To understand this we need
to consider the following things:

1. tibbles/data frames are lists of columns which are R vectors
2. R vectors are homogeneous in type
3. When we pivot longer we are trying to put all the different values in 
   different columns into a single column (thus requiring more rows)
4. but our original columns have different types.

There are ways to deal with this. One is to pivot multiple times based on 
the types of columns we have and then join the data back together, resulting in
a frame where each row is a value observation but with multiple columns, one
per type.

We could also  use a list column and wrap our elements so we can have a heterogeneous
column.

The easiest thing is to just convert everything to characters and reconvert later - a perilous
thing to do but OK for now.

```R 
library(tidyverse)

students <- read_csv("source_data/frat_boys_basic.csv")


# note we pivot _longer_ because we need more rows for our observations
student_data <- pivot_longer(students, fraternity:dietary_preference,
  names_to = "property",
  values_to = "observation",
  values_transform = function(x) ifelse(is.na(x), NA, as.character(x)))

mddf(student_data)

```
OK, so now we can answer the given question: how much data do we have on
each student?

```R 

library(tidyverse)

students <- read_csv("source_data/frat_boys_basic.csv")

mdpre(problems(students))


# note we pivot _longer_ because we need more rows for our observations
student_data <- pivot_longer(students, fraternity:dietary_preference,
  names_to = "property",
  values_to = "observation",
  values_transform = function(x) ifelse(is.na(x), NA, as.character(x))) %>%
  filter(complete.cases(.)) 

ensure_directory("derived_data")
write_csv(student_data, "derived_data/student_long.csv");

mddf(student_data %>% 
                 group_by(name) %>%  
                 tally() %>% 
                 arrange(desc(n)))



```
Just as often we want to go the other way. If we were asked to plot the students in 2D using some kind of dimensionality reduction
we'd need to convert the long data from above into a data set where each row is one student. We do that
with a `pivot_wider` because we will end up with fewer rows and more columns (a wider data frame).

```R 
library(tidyverse)

long_data <- read_csv("derived_data/student_long.csv")

mddf(long_data %>% 
      pivot_wider(id_cols=name, names_from=property, values_from=observation))
```
Great. With pivots out of the way we can ::joins_for_real:talk about all the joins::.
