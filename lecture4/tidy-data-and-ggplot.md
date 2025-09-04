---
editor_options: 
  markdown: 
    wrap: 72
---

# Introductory Notes

FINALLY we are ready to do some data-science material.

The fact is, it's a very rare situation indeed that you will receive a
"clean" dataset. This might seem like a surprise to you if you are, for
instance, a scientist working in a laboratory setting on small data
sets. In those situations, data collection is quite controlled and while
outliers and unusual circumstances may prevail from time to time, the
data collected is typically small enough that data which represents
error conditions is thrown away early. With the advent of computerized
instruments, errors in recording data (which might have been done by
hand in the past) are very unusual.

But large data sets are different. Many large datasets are generated as
a side effect of some other process and consequently don't reach the
level of cleanliness we expect from lab data. A Sales Database I once
analyzed included a large number of pseudo-duplicate entries because
Salesmen were working around a technical limitation in the database
limiting the number of contracts they could work on: salesmen would
appear multiple times in the database with names like "Smith", "Smith,
Jon", "Smith, Franklin John" etc. Form entry errors for non-essential
data are also very common. A lot of data sets cover years of a
database's existence and sometimes garbage data gets in during a
so-called "database migration" where an old version of the database has
to be moved to a new version.

A good rule of thumb is that in any dataset that is too large for one
person to look at and in which the data is not actively constrained by
some reliable external process there will be errors.

There are also [other sorts of
problems](https://www.popularmechanics.com/science/a22577/genetics-papers-excel-errors/):

![](./excel_errors.png)

# Common Problems With Data Sets

1.  Duplicate Data (records appear multiple times). This is a really
    deadly error because it can cause you to mix training and testing
    data and dramatically over-estimate the effectiveness of a model.

2.  Pseudo-Duplicate Data - Worse than above - this is data which is not
    strictly identical but is highly correlated with another set of
    records. Just as bad if you miss it.

3.  Missing Data - missing fields in records can cause otherwise smooth
    workflows to fail. Worse, some functions can lift missing data to
    spurious values (like 0) which can throw off statistics and models.
    There may also be a bias in which data is missing or which records
    are affected which will modify the results of summaries and
    modeling.

4.  Incorrectly encoded missing data. It isn't so uncommon to have
    missing values encoded in a variety of ways, even in a single data
    set. You might see a csv file where missing values are incoherently
    encoded like:

    ```         
    ,,"","NA","-","NULL",...
    ```

5.  Poorly encoded data dumps. CSV files (for example) are delimited
    with commas. Sometimes a database dump can dump fields which have
    strings in them which themselves contain commas. Frequently this
    will cause R to barf when it tries to read the data (or give
    warnings that the number of columns in each row is irregular). But
    sometimes you get very unlucky and it just shifts your data around
    in a bad way.

6.  Inconsistently encoded dates or values. Dates are the biggest risk
    here. The tidyverse tries to read columns that look like dates as
    dates, but it will struggle to get it right if there are subtle
    issues. Other gotchas: what time zone was this date/time referring
    to if it doesn't explicitly say? Do the times change to reflect
    daylight saving time? In which case, in what time zone?

The fact is you will encounter all of these issues with data sets in
your career and you will definitely miss some of them at some point.

Further raising the stakes is that all of these problems with data sets
can cause profound problems with your downstream data analysis. So data
cleansing (and recording the process) is among the most important steps
of any data science project.

# How to Defend Yourself

You must spend time getting to know your data. A large part of the
surface area of the Tidyverse is meant to help you do this but some of
R's built-in functions can also help.

# Using Dplyr and Readr

R can read a variety of tabular data formats. I'll assume we have a CSV
file for these notes but if you have other tabular data you may want to
look at `readr`'s `read_table`?

We are going to use `readr` to load a file into a `data frame`. R has
its own built-in data frame class but `dplyr` provides a more efficient
representation of the same idea. These are called `tibbles` (like
tables). `dplyr` provides a ton of utility methods to operate on
tibbles.

But before we get there let's just get comfortable with data frames.

```sidebar
Note that we will be using a few functions (`mdpre`,`mddf`, etc) in
these examples. They aren't tidyverse functions but interface with 
this book software (labradore).
```
```R 
library(tidyverse)
df <- read_csv("source_data/character-data.csv"); # open the data set
mddf(df,n=100)

```

Note that `readr` has tried its best for us to guess the appropriate
data types for each column. It does this by examining the first few
values in each column and trying to parse them and then coercing the
rest. In our case this is easy, but `readr` allows you to specify the
types of your columns by hand as well.

```R 

library(tidyverse)

df <- read_csv("source_data/character-data.csv", col_types = cols(
  character = col_character(),
  universe = col_character(),
  property_name = col_character(),
  value = col_character()))

mddf(df,n=20)
```

This is a trivial example but we could force a numerical column with
`col_number` for instance.

Once we have our data frame loaded we can poke at its variables. Here is
a useful thing to do:

```R 
library(tidyverse)
df <- read_csv("source_data/character-data.csv")
mdpre(sort(table(df$property_name), decreasing=TRUE))
```
```R file=util.R
ensure_directory <- function(path) {
  if (!dir.exists(path)) {
    dir.create(path, recursive = TRUE, showWarnings = FALSE)
  }
}
```

Let's see how gender-wise this data set is:

```R 
library(tidyverse)
library(dplyr); # only for emphasis
source("util.R")

ensure_directory("derived_data")

df <- read_csv("source_data/character-data.csv")
just_gender <- filter(df, property_name=="Gender")
mddf(just_gender, n=20)

write_csv(just_gender, "derived_data/just_gender.csv")
```

Note 2 things about the above:

1.  We are using tidy evaluation - `property_name` isn't in our
    environment, it's in the data frame `df`.
2.  We are doing a vector-wise comparison of `property_name` to
    "Gender". The expression `property_name=="Gender"` produces a
    boolean array. The True indexes are returned and the False indexes
    are thrown away.

Now we have a table just covering the Gender Property. What are the
unique values?

```R 
library(tidyverse)

just_gender <- read_csv("derived_data/just_gender.csv")

mdpre(table(just_gender$value));
```

Already we have some errors in our data set (and some ambiguities). This
data might be easier to think about in its own tabular form. We can use
`dplyr` to get there:

```R 
library(tidyverse)

just_gender <- read_csv("derived_data/just_gender.csv")

mddf(arrange(tally(group_by(just_gender, value)),n), n=100)
```

```sidebar 
consider that bit of code: `arrange(tally(group_by(just_gender, value)),n)`. 
We read it left to right (arrange, tally, group_by) but it's executed right to left
(group_by, tally, arrange). Weird, right? Wouldn't it be nice to write it 
so that it read in the same order as it is denoted?
```


When looking for unusual conditions it's good to sort from smallest to
largest.

One of the most satisfying things about data science is that it doesn't
take a lot of digging to find interesting stuff in many data sets:

1.  More than twice as many comic book characters are male than female.
2.  There are very few gender-nonconforming characters. Even fewer than
    "Genderless" ones (is this a meaningful distinction in this data
    set?)
3.  This is a remarkably clean data set. There are only a few
    pseudo-duplicates and only 6 completely incorrect entries.

When we see something unusual it's worth double-checking it. Let's take a
look at the "Good" gendered characters. Maybe something funny is going
on beyond just a misplaced value.

```R 
library(tidyverse)

just_gender <- read_csv("derived_data/just_gender.csv")

mddf(filter(just_gender, value=="Good"));
```

Well, a few new things pop out. We have a lot of duplicate entries here.

But before we deal with that let's check [our
source](https://dc.fandom.com/wiki/Scot_(Lego_Batman)) for this
character and see if we can figure out why their gender is "Good."

This looks like a genuine mistake.

We've now learned enough to start officially tidying up this data set.

Even though we've just noticed the duplicates, there is actually a step
we can do before we remove duplicates that will simplify further steps.

Let's reduce the variability of our values in a way unlikely to
introduce issues with our data:

```R 
library(tidyverse)
library(stringr); # string manipulation functions
## lowercase and remove non-ascii characters
simplify_strings <- function(s){
    s <- str_to_lower(s);
    s <- str_trim(s);
    s <- str_replace_all(s,"[^a-z]+","_")
    s
}
mdpre(simplify_strings(c(" ha", "ha! ", "aha!ha", "aha ha")))

```

## An Aside: Magrittr

You might notice there is a pattern in the function we wrote above: a
series of lines overwriting a variable on each line. There are other
ways we could have written it. This is more explicit:

```R 
library(tidyverse)
simplify_strings <- function(s){
    s <- str_to_lower(s);
    s1 <- str_trim(s);
    s2 <- str_replace_all(s1,"[^a-z]+","_")
    s2
}
```

But error prone and still verbose. We could eliminate the temporary
variables like this:

```R 
library(tidyverse)
simplify_strings <- function(s){
    str_replace_all(str_trim(str_to_lower(s)), "[^a-z]+","_");
}
```

But some people find this less than readable. In particular, in English
we tend to read right to left, but the above happens left to right and
it can be hard to parse out precisely which arguments go with which
functions.

Recall pipes in bash:
``` 
> find . -type R | xargs grep do_something_important | cut -d':' -f 1
\| sort uniq
```

Magrittr is a part of the tidyverse that allows us to build similar
pipelines in R. It provides a `%>%` binary operator which stitches
together its arguments.

```R 
library(tidyverse)
simplify_strings <- function(s){
    s %>% 
        str_to_lower() %>%
        str_trim() %>%
        str_replace_all("[^a-z1-9]+","_") %>%
        str_replace_all("^_+","") %>% # added these lines after looking at the data
        str_replace_all("_+$","");
}

```

You can think of this as "putting the result of the previous expression
into the first argument slot of the next expression" thus forming a
pipe. We will now start using this pipeline operator almost everywhere,
including in dplyr pipelines.

## Back to Business:

Let's simplify all the columns of our data set and then take the unique
values.

```R 
library(tidyverse)

simplify_strings <- function(s){
    s %>% 
        str_to_lower() %>%
        str_trim() %>%
        str_replace_all("[^a-z1-9]+","_") %>%
        str_replace_all("^_+","") %>% # added these lines after looking at the data
        str_replace_all("_+$","");
}                                          

df <- read_csv("source_data/character-data.csv")

names(df) <- simplify_strings(names(df)); ## simplify our column names
                                          ## as well
                                          

deduplicated <- df %>% mutate(across(everything(), simplify_strings)) %>%
    distinct();
    
write_csv(deduplicated, "derived_data/deduplicated.csv");
    
mdpre(sprintf("Before simplification and deduplication: %d, after %d (%0.2f %% decrease)",
              nrow(df),
              nrow(deduplicated),
              100-100*nrow(deduplicated)/nrow(df)));

mddf(deduplicated, n=100)
```

It is useful to print out how much a data set changes (by some measure)
before and after modification. Now we can re-examine our gender data,
for instance:

```R 
library(tidyverse)

deduplicated <- read_csv("derived_data/deduplicated.csv")

deduplicated %>% 
  filter(property_name=="gender") %>% 
  group_by(value) %>% 
  tally() %>%
  arrange(desc(n)) %>%
  mddf()
```

Note that we are still seeing a pretty big bias toward male characters.
Let's go ahead and canonicalize a set of genders and filter out those
that don't belong.

```R 
library(tidyverse)

deduplicated <- read_csv("derived_data/deduplicated.csv")

non_erroneous_genders <- str_split("intersex non_binary genderless female male", " ", simplify=TRUE);
tidied_data <- deduplicated %>% 
  filter((property_name == "gender" & (value %in% non_erroneous_genders)) |
                                       property_name != "gender");
tidied_data %>% filter(property_name=="gender") %>% group_by(value) %>% tally() %>%
    arrange(desc(n));
    
write_csv(tidied_data, "derived_data/tidied_data.csv")

mddf(tidied_data, n=100)
```

Now let's take a look at what other sorts of data we have.

```R 
library(tidyverse)

tidied_data <- read_csv("derived_data/tidied_data.csv")

properties <- tidied_data %>% group_by(property_name) %>% tally() %>% arrange(desc(n)) %>% head(100);

mddf(properties,n=100)
```

Keeping with the theme of examining gender constructs in comics, let's
look at a few things which we may expect to vary by gender.

```R file=prop_table.R
prop_table <- function(df, property){
    df %>% filter(property_name == property) %>% group_by(value) %>%
        tally() %>% arrange(desc(n));
}
```
```R 
library(tidyverse)

source("prop_table.R")

tidied_data <- read_csv("derived_data/tidied_data.csv")

mddf(prop_table(tidied_data, "alignment"));
```

```R 
library(tidyverse)

source("prop_table.R")

tidied_data <- read_csv("derived_data/tidied_data.csv")

mddf(prop_table(tidied_data, "hair"))
```

```R 
library(tidyverse)

source("prop_table.R")

tidied_data <- read_csv("derived_data/tidied_data.csv")

mddf(prop_table(tidied_data, "eyes"))
```

```R 
library(tidyverse)

tidied_data <- read_csv("derived_data/tidied_data.csv")

mddf(prop_table(tidied_data, "marital_status"))
```

```R 
library(tidyverse)

source("prop_table.R")

tidied_data <- read_csv("derived_data/tidied_data.csv")

mddf(prop_table(tidied_data, "occupation"))
```

We can see a few unusual things in these tables. There are a few ways to
approach this. We could restrict ourselves to a handful of properties of
interest and clean them by hand. But I'm going to take a more of a
shotgun approach here:

We're going to throw away any value from any property which appears less
than 20 times. Extremely rare properties aren't going to be of much use
to us anyway.

There are many ways we can do this and we can get complicated about the
criteria. But I'm going to do it the simplest: I'm just going to throw
out rows with very rare values.

This is a chance for us to look at a slightly less than trivial
manipulation and to experiment with joins.

```R 
library(tidyverse)

tidied_data <- read_csv("derived_data/tidied_data.csv")

value_counts <- tidied_data %>% group_by(value) %>% tally() %>%
    arrange(n);
mddf(value_counts, n=100)

write_csv(value_counts, "derived_data/value_counts.csv")



```

If we check these out we can see that we have a lot of weird ones - it
seems like some of the assumptions we've used to simplify the data have
messed up some rows where multiple comma separated values and/or
explanatory sentences have appeared.

We could try to salvage these but for the sake of brevity we're just
going to chop them off.

```R 
library(tidyverse)

# Load the previously saved value counts and derive ok_values
value_counts <- read_csv("derived_data/value_counts.csv")
ok_values <- value_counts %>% filter(n>=10) %>% pull(value)
ok_values_df <- tibble(value = ok_values)

# Persist for any later blocks that need it
write_csv(ok_values_df, "derived_data/ok_values.csv")

mddf(ok_values_df, n=100)
```

Note that we can filter out the unwanted properties with a line like:

```R 
library(tidyverse)

# Demonstration of filtering with ok_values; make it self-contained
tidied_data <- read_csv("derived_data/tidied_data.csv")
ok_values <- read_csv("derived_data/ok_values.csv") %>% pull(value)

tidied_data <- tidied_data %>% filter(value %in% ok_values)
mddf(tidied_data, n=100)
```

But this is a reasonably good time to introduce *joins*.

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

## Other Summaries

You can often get a good sense about how to approach a data set by
grouping on more than one column. What we want to do next is pose
questions like:

Are male (coded) characters more or less likely to be married than
female (coded) characters?

But to answer this question we have to delve into "tidy" data.

## Tidy vs Non-Tidy Data

An important idea in the tidyverse is "tidy" data. This means more than
just clean or nice data. It means that whatever our concept of an
"observation" is our data frames should contain one row per observation.
At present our data is *very* tidy because I wrote the web scraper to
scrape into a tidy form.

In our case an observation is a "character, universe, property_name, and
value".

The tidyverse assumes that your data is tidy in its design. This allows
it to be much simpler than it might otherwise be.

But not all data is tidy to begin with. Its pretty common to see
so-called "wide" data:

```R 
library(tidyverse)
u <- read_csv("untidy-example.csv")
mddf(u, n=100)
```

This data set contains many observations per row. This can make certain
things easier (for instance, we can easily count how often
super_strength and super_speed appear together). But it won't fly with
many tidyverse functions. We need to learn how to "narrow" "wide" data.

## Pivots

The tidyverse package `tidyr` has functions for narrowing and widening
data sets.

```R 
library(tidyverse)
library(tidyr)
u <- read_csv("untidy-example.csv")
u_long <- pivot_longer(u, cols=super_strength:super_intelligence, values_to="value", names_to="power")
mddf(u_long, n=100)
```

You may notice that this is more or less how my power dataset looks.

You will need to have your data in tidy format to use ggplot
effectively.

But in our case, we really do want to compare gender and marital status,
so we want to widen (a subset) of our data.

```R 
library(tidyverse)
tidied_data <- read_csv("derived_data/tidied_data.csv")

gender_marital <- tidied_data %>%
    filter(property_name == 'gender' | property_name == 'marital_status');

mddf(gender_marital, n=100)

write_csv(gender_marital, "derived_data/gender_marital.csv")
```

When we `pivot_longer` we need to understand which columns we need to
convert to observations. To `pivot_wider` we need to understand which
observations we want to convert to rows.

But we have a bit more tidying to do before we can get there. Question:
it seems obvious, but how can we be sure that we don't have unique
characters here with two or more genders or marital statuses?

This is a disadvantage of tidy data: we may have repeat or even
logically mutually exclusive observations.

Let's examine that question.

```R 
library(tidyverse)
gender_marital <- read_csv("derived_data/gender_marital.csv")

mddf(gender_marital %>% filter(property_name == 'gender') %>%
    group_by(character, universe) %>% tally() %>%
    arrange(desc(n)), n=100);
```

Looks like our gender data is good.

```R 
library(tidyverse)
gender_marital <- read_csv("derived_data/gender_marital.csv")

marital_status_counts <- gender_marital %>%
    filter(property_name == 'marital_status') %>%
    group_by(character, universe) %>%
    tally() %>%
    arrange(desc(n));
mddf(marital_status_counts, n=100);
write_csv(marital_status_counts, "derived_data/marital_status_counts.csv")
```

But it seems like we have a few characters with multiple marital
statuses. Let's filter them out.

```R 
library(tidyverse)
gender_marital <- read_csv("derived_data/gender_marital.csv")
marital_status_counts <- read_csv("derived_data/marital_status_counts.csv")

gender_marital <- gender_marital %>%
    left_join(marital_status_counts, by=c("character","universe")) %>%
    filter(n == 1) %>%
    select(-n);
write_csv(gender_marital, "derived_data/gender_marital_filtered.csv")

mddf(gender_marital, n=100)
```

And now we can check whether we got it right.

```R 
library(tidyverse)
gender_marital <- read_csv("derived_data/gender_marital_filtered.csv")

mddf(gender_marital %>% filter(property_name == 'marital_status') %>%
    group_by(character, universe) %>%
    tally() %>%
    arrange(desc(n)), n=100);
```

Ok. Now we can perform our widen.

```R 
library(tidyverse)
gender_marital <- read_csv("derived_data/gender_marital_filtered.csv")

gm_wider <- gender_marital %>% pivot_wider(id_cols=character:universe, names_from = 'property_name',
                               values_from='value');
write_csv(gm_wider, "derived_data/gm_wider.csv")

mddf(gm_wider, n=100)
```

And now we can get a sense for our question: does gender correlate with
marital status in comics?

```R 
library(tidyverse)
gm_wider <- read_csv("derived_data/gm_wider.csv")

status_counts <- gm_wider %>%
    group_by(gender, marital_status) %>%
    tally();
mddf(status_counts, n=100)
write_csv(status_counts, "derived_data/status_counts.csv")
```

This isn't enough, though, we need to normalize by total number with
each gender.

```R 
library(tidyverse)
gm_wider <- read_csv("derived_data/gm_wider.csv")

gender_counts <- gm_wider %>%
    group_by(gender) %>%
    tally();
mddf(gender_counts, n=100)
write_csv(gender_counts, "derived_data/gender_counts.csv")
```

And now we do a join.

```R 
library(tidyverse)
status_counts <- read_csv("derived_data/status_counts.csv")
gender_counts <- read_csv("derived_data/gender_counts.csv")

status_probs <- status_counts %>%
    left_join(gender_counts, by="gender", suffix=c("",".gender")) %>%
    mutate(p=n/n.gender)

mddf(status_probs, n=100)

mddf(status_probs %>%
    filter(gender %in% c("male","female") & marital_status %in% c("single","married","divorced")) %>%
    arrange(desc(p)), n=100);
write_csv(status_probs, "derived_data/status_probs.csv")
```

We can imagine producing a series of such tables to get a sense for
whether there is anything interesting in this data. Sometimes looking at
tables is enough, but even a moderate number of things to look at can be
overwhelming.

That is why data exploration also requires the ability to make figures.
Lots of them.

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

# ggplot

The `gg` in `ggplot` stands for "grammar of graphics."

As a teaser, let's plot the data we just calculated:

```R 
library(tidyverse)
library(ggplot2); # note the 2

status_probs <- read_csv("derived_data/status_probs.csv")

ggmd(ggplot(status_probs, aes(marital_status, p)) +
    geom_bar(aes(fill=gender), stat="identity", position="dodge"))

```

Already we can see how much easier this data is to consume. With just a
little more elbow grease we can have a pretty professional looking plot:

```R 
library(tidyverse)
library(ggplot2); # note the 2

status_probs <- read_csv("derived_data/status_probs.csv")

ggmd(ggplot(status_probs, aes(marital_status, p)) +
    geom_bar(aes(fill=gender), stat="identity", position="dodge") +
    labs(x="Marital Status",y="Probability",title="Gender and Marriage in Comics"));

```

So how does this work?

## ggplot concepts

ggplot works by letting you associate *data* with *aesthetics*. Data is
what you store in a data frame. An aesthetic is any sort of thing you
might use to distinguish objects visually.

The most trivial example:

```R 
library(tidyverse)
x <- seq(from=0,to=10,length.out=100);
df <- tibble(x=x, y=3*x + 2 + rnorm(length(x)))
ggmd(ggplot(df,aes(x,y)) + geom_point());

```

Note that when we use grammar of graphics we don't think about *plot
types*. We think about *data* and *aesthetics* from which plot types
naturally derive.

What is the benefit of thinking this way?

```R 
library(tidyverse)
df <- tibble(x=seq(from=0,to=10,length.out=100)) %>%
  mutate(y = 3*x + 2 + rnorm(length(x)))
df$category <- sample(factor(c(1,2,3)),size=nrow(df),replace=TRUE)
ggmd(ggplot(df,aes(x,y)) + geom_point(aes(color=category)));

```

Believe it or not the above example pretty much sums up how to use the
basic features of ggplot:

1.  figure out how you want to map your data to aesthetics
2.  figure out your geometry type
3.  use aes() to map additional aesthetics to your geometry.

Other things of note:

1.  because ggplot isn't strictly pipelining, we chain our ggplot
    functions with `+` rather than `%>%`.
2.  A bunch of meta-functions control things like axis labels, font
    size, etc. We'll need these to make some genuinely attractive plots.

But getting the hang of ggplot takes some work. Let's take a look at
some of the more common examples.

One nice thing is that the `histogram` geometry can do the counting for
you.

```R 
library(tidyverse)
tidied_data <- read_csv("derived_data/tidied_data.csv")
ggmd(ggplot(tidied_data, aes(property_name)) + geom_histogram(stat="count"));
```

Well, that is nice but it's a far from ideal result. The x-axis labels
are unreadable. Let's fix that:

```R 
library(tidyverse)
tidied_data <- read_csv("derived_data/tidied_data.csv")
ggmd(ggplot(tidied_data, aes(property_name)) +
    geom_histogram(stat="count") +
    theme(axis.text.x = element_text(angle = 90)));
```

Note: I literally *always* google "ggplot rotate x label" for this.

This figure is still hard to read. Let's put the x-axis in order by
count. To do this we need to appreciate factor variables.

Factors are what R uses when you have some numerical or otherwise base data
but you want to highlight the fact that these are categorical and may
have an order. ggplot will respect the factor order if a column is a
factor variable, so let's coerce our property_name variable into a factor
based on total count.

```R 
library(tidyverse)
tidied_data <- read_csv("derived_data/tidied_data.csv")
properties_in_order <- tidied_data %>% group_by(property_name) %>%
    tally() %>%
    arrange(desc(n),property_name) %>% `[[`("property_name");

ggmd(ggplot(tidied_data, aes(factor(property_name,properties_in_order))) +
    geom_histogram(stat="count") +
    theme(axis.text.x = element_text(angle = 90)));

```

Sorting the axes this way lets us get a nice sense for the data set. It
is sort of interesting that we have more information on the characters'
hair and eye colors than on their marital statuses.

Let's do a few scatter plots. First a sanity check. We should expect
that roughly the number of properties of a superhero and the page
length should correlate. Very roughly.

```R 
library(tidyverse)
library(stringr)

simplify_strings <- function(s){
    s %>% 
        str_to_lower() %>%
        str_trim() %>%
        str_replace_all("[^a-z1-9]+","_") %>%
        str_replace_all("^_+","") %>%
        str_replace_all("_+$","")
}

page_lengths <- read_csv("source_data/character-page-data.csv")
names(page_lengths) <- simplify_strings(names(page_lengths))
page_lengths <- page_lengths %>% mutate(across(character:universe, simplify_strings))

write_csv(page_lengths, "derived_data/page_lengths.csv")

mddf(page_lengths, n=100)
```

```R 
library(tidyverse)
tidied_data <- read_csv("derived_data/tidied_data.csv")
page_lengths <- read_csv("derived_data/page_lengths.csv")

property_counts <- tidied_data %>% group_by(character, universe) %>% tally(name="prop_count")

df <- property_counts %>% inner_join(page_lengths, by=c("character","universe"))

ggmd(ggplot(df, aes(page_length, prop_count)) + geom_point() + labs(x="Page Length",y="Property Count"));
```

How does this data interact with gender? Let's pull out the gender data
and join it to our data set.

```R 
library(tidyverse)
tidied_data <- read_csv("derived_data/tidied_data.csv")

gender_data <- tidied_data %>% filter(property_name=="gender") %>%
    rename(gender=value) %>%
    select(-property_name);
mddf(gender_data, n=100)

page_lengths <- read_csv("derived_data/page_lengths.csv")
property_counts <- tidied_data %>% group_by(character, universe) %>% tally(name="prop_count")

df <- property_counts %>% inner_join(page_lengths, by=c("character","universe")) %>%
    inner_join(gender_data, by=c("character","universe"))

mddf(df, n=100)
write_csv(gender_data, "derived_data/gender_data.csv")
write_csv(df, "derived_data/prop_page_gender.csv")

ggmd(ggplot(df,aes(page_length, prop_count)) + geom_point(aes(color=gender)) + labs(x="Page Length",y="Property Count"));

```

We see here a pretty common problem with scatter plots: when the points
lie on top of one another it's hard to see what is going on. We can take
a few approaches to solving this. Here is a quick and dirty one:

```R 
library(tidyverse)
df <- read_csv("derived_data/prop_page_gender.csv")

ggmd(ggplot(df,aes(page_length, prop_count + 0.75*runif(nrow(df)))) +
    geom_point(aes(color=gender)) +
    labs(x="Page Length",y="Property Count"));

```

Still sort of bad:

```R 
library(tidyverse)
df <- read_csv("derived_data/prop_page_gender.csv")

ggmd(ggplot(df,aes(page_length, prop_count + 0.75*runif(nrow(df)))) +
    geom_point(aes(color=gender),alpha=0.3) +
    labs(x="Page Length",y="Property Count"));

```

This might call for a box plot.

```R 
library(tidyverse)
df <- read_csv("derived_data/prop_page_gender.csv")

ggmd(ggplot(df %>% filter(page_length > 3.75e5) %>% filter(gender %in% c("male","female")), aes(factor(prop_count),page_length)) +
    geom_boxplot(aes(color=gender)) + ylim(3.75e5,500000));

```

Looking at this data tells us a few things.

1.  There is a trend for female-coded characters have shorter pages.
2.  The data is very not-normal, probably reflecting some missing
    componenets in our understanding of the data.

Let's take a look at just that question using a density plot.

```R 
library(tidyverse)
df <- read_csv("derived_data/prop_page_gender.csv")
ggmd(ggplot(df %>%
       filter(page_length < 500000 & gender %in% c("male",
                                                   "female")),
       aes(page_length)) + geom_density(aes(fill=gender),
                                        alpha=0.5));
```

Not all that enlightening.

```R 
library(tidyverse)
df <- read_csv("derived_data/prop_page_gender.csv")
ggmd(ggplot(df %>%
       filter(page_length < 500000 & gender %in% c("male",
                                                   "female")),
       aes(page_length)) + geom_histogram(aes(fill=gender),
                                          alpha=0.5,
                                          position="dodge"));
```

Still not all that enlightening! Probably going to dig into this.

```R 
library(tidyverse)
df <- read_csv("derived_data/prop_page_gender.csv")
ggmd(ggplot(df %>%
       filter(page_length < 500000 & page_length > 375000 & gender %in% c("male",
                                                                          "female")),
       aes(page_length)) + geom_density(aes(fill=gender),
                                        alpha=0.5,
                                        position="dodge"));
```

## GGPlot Geometries

GGPlot will pretty much let you do anything. You just need to find the
right geometry.

1.  geom_point - points
2.  geom_histogram - histogram, performs aggregation itself (geom_bar +
    stat bin)
3.  geom_density - density plot (using a kernel density estimate)
4.  geom_boxplot - boxplot (plots centroids and widths w/ outliers)
5.  geom_rect - general rectangles
6.  geom_bar - bar graph can perform all sorts of aggregations
7.  Many others

Aesthetics (not all aesthetics apply to all geometries)

1.  color - the color of a point or shape or the color of the boundary
    of a polygon or rectangle.
2.  fill - the color of the interior of a polygon or rectangle
3.  alpha - the transparency of a color
4.  position - for histograms and bar plots how to position boxes for
    the same x aesthetic. "dodge" is the clearest.

## Non-trivial Example

Let's try to appreciate whether powers are distributed difference
between male and female characters. This is a figure which will be
merely suggestive rather than statistically meaningful. We will examine
*rank* rather than difference.

```R 
library(tidyverse)
library(stringr)

simplify_strings <- function(s){
    s %>% 
        str_to_lower() %>%
        str_trim() %>%
        str_replace_all("[^a-z1-9]+","_") %>%
        str_replace_all("^_+","") %>%
        str_replace_all("_+$","")
}

powers <- read_csv("source_data/powers.csv");
powers <- powers %>% mutate(across(power:universe, simplify_strings)) %>%
    distinct();

mddf(powers, n=100)

gender_data <- read_csv("derived_data/gender_data.csv")

powers_gender <- powers %>% inner_join(gender_data, by=c("character", "universe")) %>%
    select(-url) %>%
    filter(gender %in% c("male","female"));
mddf(powers_gender, n=100)

write_csv(powers, "derived_data/powers_clean.csv")
write_csv(powers_gender, "derived_data/powers_gender.csv")

```

We want to calculate for each power `P(power|gender)`.

```R 
library(tidyverse)
gender_data <- read_csv("derived_data/gender_data.csv")
powers_gender <- read_csv("derived_data/powers_gender.csv")

gender_counts <- gender_data %>% group_by(gender) %>% tally(name="total");
probs <- powers_gender %>%
    inner_join(gender_counts, by="gender") %>%
    group_by(power, gender, total)  %>% 
    summarize(p=length(character)/total[[1]]) %>%
    arrange(gender,desc(p)) %>%
    group_by(gender) %>%
    mutate(rank=seq(length(p))) %>%
    ungroup();
mddf(gender_counts, n=100)
mddf(probs, n=100)

write_csv(gender_counts, "derived_data/gender_counts.csv")
write_csv(probs, "derived_data/power_gender_probs.csv")
```

```R 
library(tidyverse)
probs <- read_csv("derived_data/power_gender_probs.csv")
mddf(probs %>% filter(gender=="male"), n=100)
```

Let's just keep the first 20 powers.

```R 
library(tidyverse)
probs <- read_csv("derived_data/power_gender_probs.csv")
ranked_gendered <- probs %>% filter(rank<=20) %>% select(-p,-total);
mddf(ranked_gendered, n=100)

power_order <- ranked_gendered %>% group_by(power) %>% summarize(mr = mean(rank)) %>%
    arrange(mr) %>% `[[`("power")

ranked_gendered$power <- factor(ranked_gendered$power,power_order);

write_csv(ranked_gendered, "derived_data/ranked_gendered.csv")

```

We want a totally custom plot here. On the left we want to have the
female powers and the male powers on the right.

First a utility:

```R file=gender_to_x.R
gender_to_x <- function(g){
  x <- c("male" = 1, "female" = -1)
  x[g]
}


```

```R 
library(tidyverse)
ranked_gendered <- read_csv("derived_data/ranked_gendered.csv")
source("gender_to_x.R")

ggmd(ggplot(ranked_gendered) +
    geom_rect(aes(xmin=gender_to_x(gender)-0.5,
              xmax=gender_to_x(gender)+0.5,
              ymin=21-rank-0.45,
              ymax=21-rank+0.45,
              fill=power)) +
    geom_text(aes(x=gender_to_x(gender),
                  y=21-rank,
                  label=power)));
```

This is nice but let's put a little more polish on this and add lines
connecting the same power on each side. This will require massaging our
data a little.

```R 
library(tidyverse)
ranked_gendered <- read_csv("derived_data/ranked_gendered.csv")

male <- ranked_gendered %>% filter(gender=="male") %>%
    rename(male_rank=rank);
female <- ranked_gendered %>% filter(gender=="female") %>%
    rename(female_rank=rank);

line_data_male <- male %>% left_join(female, by="power") %>%
    select(-gender.x, -gender.y);
line_data_female <- male %>% right_join(female, by="power") %>%
    select(-gender.x, -gender.y);

line_data <- rbind(line_data_male, line_data_female) %>% distinct() %>%
    mutate(male_rank=replace_na(male_rank,21),
           female_rank=replace_na(female_rank,21));


mddf(line_data, n=100)
write_csv(line_data, "derived_data/line_data.csv")
```

Note that we can use multiple data sets per plot:

```R 
library(tidyverse)
ranked_gendered <- read_csv("derived_data/ranked_gendered.csv")
line_data <- read_csv("derived_data/line_data.csv")
source("gender_to_x.R")

ggmd(ggplot(ranked_gendered) +
    geom_rect(aes(xmin=gender_to_x(gender)-0.5,
              xmax=gender_to_x(gender)+0.5,
              ymin=rank-0.45,
              ymax=rank+0.45,
              fill=power),
              show.legend = FALSE) +
    geom_text(aes(x=gender_to_x(gender),
                  y=rank,
                  label=power)) +
    geom_segment(data=line_data,aes(x=-0.5,xend=0.5,
                            y=female_rank,
                            yend=male_rank,
                            color=power),
                 show.legend = FALSE) +
    ylim(0,21) +
    scale_y_reverse(breaks = 1:20) +
    scale_x_continuous(breaks=c(-1,1),
                       labels=c("Female","Male")) + 
    labs(x="Sex Presentation",y="Rank", title="Are superpowers distributed differently by presented sex?"));

```

# What Makes A Visualization Good?

The primary benefit of a visualization is the ability to see a lot of
data at once in a way which your brain can interpret rapidly. Therefore
the science of good visualization is the science of what sorts of
aesthetics you can apprehend pre-attentively.

Everyone always burns the pie chart in effigy here, so let's do it:

![](./bad-pie-chart.png)

From
<https://www.r-bloggers.com/2015/12/fear-of-wapo-using-bad-pie-charts-has-increased-since-last-year/>

Pie Charts are bad because they make you judge areas of irregular shapes
which may not be adjacent.

Rule of Thumb: a visualization should focus on one or two distinctions
or trends which it should encode with:

1.  position
2.  color
3.  size
4.  shape

Roughly in that order. Size is best used to compare *adjacent lengths*.
Areas and volumes or lengths which are not near one another are quite
hard for people to judge accurately.

```R 
library(tidyverse)
juxtapose <- function(df, p1, p2){
  df <- df %>% filter(property_name == p1 | property_name == p2);
  counts <- df %>% group_by(character, universe, property_name) %>% tally()
  df <- df %>% inner_join(counts, by=c("character","universe","property_name")) %>%
    filter(n==1) %>% select(-n);
  df %>% pivot_wider(id_cols=character:universe, names_from = "property_name",
                     values_from = "value") %>% filter(complete.cases(.));
}

deduplicated <- read_csv("derived_data/deduplicated.csv")

gender_hair <- juxtapose(deduplicated, "gender", "hair");
important_hair <- gender_hair %>% group_by(hair) %>% tally() %>% 
  arrange(desc(n)) %>% 
  pull(hair) %>%
  head(10);

`%not_in%` <- function(x, a){
  !(x %in% a)
}

gender_hair <- gender_hair %>% filter(hair %in% important_hair &
                                        gender %in% c("male", "female"));

gender_hair <- rbind(gender_hair %>% filter(gender=="male") %>% sample_n(1000),
                     gender_hair %>% filter(gender=="female") %>% sample_n(1000));

ggmd(ggplot(gender_hair, aes(hair)) + geom_bar(aes(fill=gender)))


mddf(gender_hair, n=100)
write_csv(gender_hair, "derived_data/gender_hair.csv")
```

Compare this with

```R 
library(tidyverse)
gender_hair <- read_csv("derived_data/gender_hair.csv")
ggmd(ggplot(gender_hair, aes(hair)) + geom_bar(aes(fill=gender),position="dodge"));
```

```R 
library(tidyverse)

```

```R 
library(tidyverse)

```

```R 
library(tidyverse)

```

```R 
library(tidyverse)

```
