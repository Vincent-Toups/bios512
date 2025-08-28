# Review of Dplyr & TidyR

1.  Dplyr works on data frames. You usually get these from `readr`
    loading a csv or other table file. But you might get them from a
    database or some other source.
2.  Dplyr will work on (and indeed convert to) `tibbles` which is the
    tidyverse version of a data frame: a tabular data structure with
    named columns.
3.  Dplyr code is typically written with the `%>%` pipeline operator.
    This is possible because the first element of every `dplyr` function
    is the table to work on.
4.  There are a lot of dplyr functions. Use the docs.
5.  We will want to get our data into (and sometimes out of) "tidy"
    format. `pivot_longer` and `pivot_wider` do this for us.

Useful/common dplyr function:

1.  select(c1, c2, ...) return a new data frame with only the selected
    columns.
2.  rename(new_name=old_name, ...) return a new data frame with the
    renamings.
3.  mutate(name=expr,...) adds or modifies columns
4.  filter(boolean_expr) returns a dataframe with only matching *rows*
5.  group_by(expr,...) group by an expression or multiple columns.
    Returns a grouping. After you group you can summarize or otherwise
    modify the groups.
6.  tally - count the elements in the grouping and return a data frame
    with the group keys and the count.
7.  summarize(name=expr,...) operate per group and produce a table of
    summaries.


::06_ggplot:Next： ggplot::
