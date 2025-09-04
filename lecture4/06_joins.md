## Joins

In the world of tidy data (and in any world based on tabular data), you
will often find the need to combine two data sets based on some
criteria.

In our toy example above, we have two data sets: our character-level
data set, where each row contains a character, a universe, a
property_name and a value; and a second data set consisting of rows
containing a property name and a count associated with it.

We might like to combine these two sets into a third which contains all
the columns of both sets, joined up appropriately. This would result in
a data set with character, universe, property_name, value and
value_count. This combination is called a "join" on the "property_name"
column.

Once we have the `value_count` attached to our rows, we can filter out
all rows where the value count is smaller than 10 and then throw away
the `value_count` property entirely.

This sounds simple enough, but we should think about what could go wrong
in the general case. Consider two tables, the left and the right. For
simplicity, we'll join on a "column" which is shared by both tables. The
following things might happen:

1.  every value in the left table occurs exactly once in the right
    table.
2.  some values appear more often in the right or left table.
3.  the left table has values the right table doesn't have.
4.  the right table has values the left table doesn't have.

1 excludes 2-4 but 2-4 can coexist. What we want to do in these
situations decides the "type" of join we want to perform.

1.  left join: keep every row from the left table, substitute some
    missing or other value for right table values when there is not a
    match.
2.  right join: same as above, but right for left.
3.  inner_join: keep only rows where there is a matching index.

There is another kind of join: a cross join. This just pairs each row of
left with every row of right. You may want to do this in some situations
but it tends to blow up your data volume fast. Typically you will do a
filter immediately after a cross join and select a small criteria. Eg:
you want all the points in a data set which are less than some Euclidean
distance from one another. This is a cross join and a filter. But if you
need to do this for a very large data set you will need a custom data
structure or database.

Note that a join can *make your data set bigger* if matching key columns
appear more than once in the left or right table.

Joins are all over the place: they occur in dplyr, pandas and SQL. They
are quite general. It's worth developing at least a superficial
understanding.

```R 
library(tidyverse)
tidied_data <- read_csv("derived_data/tidied_data.csv")
value_counts <- read_csv("derived_data/value_counts.csv")

joined <- tidied_data %>% inner_join(value_counts, by="value")

# Persist for later use
write_csv(joined, "derived_data/joined.csv")

mddf(joined, n=100)
```

Now that we have our join we can filter our data set:

```R 
library(tidyverse)
joined <- read_csv("derived_data/joined.csv")

tidied_data <- joined %>% filter(n > 10) %>% select(-n)

# Persist the refined tidied data
write_csv(tidied_data, "derived_data/tidied_data.csv")

mddf(tidied_data, n=100)
```

Exploration of other joins is left to homework exercises.


::07_summaries_tidy_pivots:Next∶ Summaries, Tidy vs Non-Tidy, Pivots::
