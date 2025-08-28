# Using Dplyr and Readr

R can read a variety of tabular data formats. I'll assume we have a CSV
file for these notes but if you have other tabular data you may want to
look at `readr`'s `read_table`?

We are going to use `readr` to load a file into a `data frame`. R has
its own built in data frame class but `dplyr` provides a more efficient
representation of the same idea. These are called `tibbles` (like
tables). `dplyr` provides a ton of utility methods to operate on
tibbles.

But before we get there lets just get comfortable with data frames.

```R 
library(tidyverse)
# Persistence + display scaffolding (stateless execution helpers)
if (!dir.exists("intermediate")) dir.create("intermediate", recursive = TRUE)
if (!exists("mdpre")) mdpre <- function(x) { print(x) }
if (!exists("ggmd"))  ggmd  <- function(p) { print(p) }
```

```R 
library(tidyverse)
df <- read_csv("source_data/character-data.csv"); # open the data set
mdpre(df)
# persist raw load for later chunks
saveRDS(df, file = "intermediate/df_raw.rds")
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
  value = col_character()
  ))
mdpre(df)
saveRDS(df, file = "intermediate/df_typed.rds")
```

This is a trivial example but we could force a numerical column with
`col_number` for instance.

Once we have our data frame loaded we can poke at its variables. Here is
a useful thing to do:

```R 
library(tidyverse)
if (!exists("mdpre")) mdpre <- function(x) print(x)
if (file.exists("intermediate/df_typed.rds")) {
  df <- readRDS("intermediate/df_typed.rds")
} else {
  df <- readr::read_csv(
    "source_data/character-data.csv",
    col_types = cols(
      character = col_character(),
      universe = col_character(),
      property_name = col_character(),
      value = col_character()
    )
  )
}
mdpre(sort(table(df$property_name), decreasing=TRUE))
```

Let's see how gender-wise this data set is:

```R 
library(tidyverse)
if (file.exists("intermediate/df_typed.rds")) {
  df <- readRDS("intermediate/df_typed.rds")
} else {
  df <- readr::read_csv(
    "source_data/character-data.csv",
    col_types = cols(
      character = col_character(),
      universe = col_character(),
      property_name = col_character(),
      value = col_character()
    )
  )
}
just_gender <- filter(df, property_name=="Gender")
saveRDS(just_gender, file = "intermediate/just_gender.rds")
```

Note 2 things about the above:

1.  We are using tidy evaluation - `property_name` isn't in our
    environment, its in the data frame `df`.
2.  We are doing a vector-wise comparison of `property_name` to
    "Gender". The expression `property_name=="Gender"` produces a
    boolean array. The True indexes are returned and the False indexes
    are thrown away.

Now we have a table just covering the Gender Property. What are the
unique values?

```R 
library(tidyverse)
if (!exists("mdpre")) mdpre <- function(x) print(x)
if (file.exists("intermediate/just_gender.rds")) {
  just_gender <- readRDS("intermediate/just_gender.rds")
}
mdpre(table(just_gender$value));
```

Already we have some errors in our data set (and some ambiguities). This
data might be easier to think about in its own tabular form. We can use
`dplyr` to get there:

```R 
library(tidyverse)
suppressPackageStartupMessages(library(dplyr))
if (!exists("mdpre")) mdpre <- function(x) print(x)
if (file.exists("intermediate/just_gender.rds")) {
  just_gender <- readRDS("intermediate/just_gender.rds")
}
mdpre(arrange(tally(group_by(just_gender, value)),n))
```

When looking for unusual conditions its good to sort from smallest to
largest.

One of the most satisfying things about data science is that it doesn't
take a lot of digging to find interesting stuff in many data sets:

1.  More than twice as many comic book characters are male than female.
2.  There are very few gender-noncomforming characters. Even fewer than
    "Genderless" ones (is this a meaningful distinction in this data
    set?)
3.  This is a remarkably clean data set. There are only a few
    pseudo-duplicates and only 6 completely incorrect entries.

When we see something unusual its worth double checking it. Let's take a
look at the "Good" gendered characters. Maybe something funny is going
on beyond just a misplaced value.

```R 
library(tidyverse)
if (!exists("mdpre")) mdpre <- function(x) print(x)
if (file.exists("intermediate/just_gender.rds")) {
  just_gender <- readRDS("intermediate/just_gender.rds")
}
mdpre(filter(just_gender, value=="Good"));
```

Well, a few new things pop out. We have a lot of duplicate entries here.

But before we deal with that lets check [our
source](https://dc.fandom.com/wiki/Scot_(Lego_Batman)) for this
character and see if we can figure out why their gender is "Good."

This looks like a genuine mistake.

We've know learned enough to start officialy tidying up this data set.

Even though we've just noticed the duplicates, there is actually a step
we can do before we remove duplicates that will simplify futher steps.

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

But some people find this less than readable. In particular, in english
we tend to read right to left, but the above happens left to right and
it can be hard to parse out precisely which arguments go with which
functions.

In bash, we we could spend time learning if you all wish:

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
# helper used below
simplify_strings <- function(s){
  s <- stringr::str_to_lower(s)
  s <- stringr::str_trim(s)
  s <- stringr::str_replace_all(s, "[^a-z]+", "_")
  s
}
df <- readRDS("intermediate/df_typed.rds")

names(df) <- simplify_strings(names(df)); ## simplify our column names
                                          ## as well

deduplicated <- df %>% mutate(across(everything(), simplify_strings)) %>%
    distinct();
mdpre(sprintf("Before simplification and deduplication: %d, after %d (%0.2f %% decrease)",
              nrow(df),
              nrow(deduplicated),
              100-100*nrow(deduplicated)/nrow(df)));
saveRDS(deduplicated, file = "intermediate/deduplicated.rds")
```

It is useful to print out how much a data set changes (by some measure)
before and after modification. Now we can re-examine our gender data,
for instance:

```R 
library(tidyverse)
deduplicated <- readRDS("intermediate/deduplicated.rds")
mdpre(deduplicated %>% filter(property_name=="gender") %>% group_by(value) %>% tally() %>%
    arrange(desc(n)))
```

Note that we are still seeing a pretty big bias towards male characters.
Let's go ahead and canonicalize a set of genders and filter out those
that don't belong.

```R 
library(tidyverse)
deduplicated <- readRDS("intermediate/deduplicated.rds")
non_erroneous_genders <- str_split("intersex non_binary genderless female male", " ", simplify=TRUE);
tidied_data <- deduplicated %>% filter((property_name == "gender" & (value %in% non_erroneous_genders)) |
                                       property_name != "gender");
mdpre(tidied_data %>% filter(property_name=="gender") %>% group_by(value) %>% tally() %>%
    arrange(desc(n)))
saveRDS(tidied_data, file = "intermediate/tidied_data.rds")
```

Now let's take a look at what other sorts of data we have.

```R 
library(tidyverse)
tidied_data <- readRDS("intermediate/tidied_data.rds")
properties <- tidied_data %>% group_by(property_name) %>% tally() %>% arrange(desc(n)) %>% head(100);
```

Keeping with the theme of examining gender constructs in comics, let's
look at a few things which we may expect to vary by gender.

```R 
library(tidyverse)
tidied_data <- readRDS("intermediate/tidied_data.rds")
prop_table <- function(df, property){
    df %>% filter(property_name == property) %>% group_by(value) %>%
        tally() %>% arrange(desc(n));
}

tidied_data <- readRDS("intermediate/tidied_data.rds")
prop_table(tidied_data, "alignment");
```

```R 
library(tidyverse)
tidied_data <- readRDS("intermediate/tidied_data.rds")
prop_table(tidied_data, "hair")
```

```R 
library(tidyverse)
tidied_data <- readRDS("intermediate/tidied_data.rds")
prop_table(tidied_data, "eyes")
```

```R 
library(tidyverse)
tidied_data <- readRDS("intermediate/tidied_data.rds")
prop_table(tidied_data, "marital_status")
```

```R 
library(tidyverse)
tidied_data <- readRDS("intermediate/tidied_data.rds")
prop_table(tidied_data, "occupation")
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
tidied_data <- readRDS("intermediate/tidied_data.rds")
value_counts <- tidied_data %>% group_by(value) %>% tally() %>%
    arrange(n);
mdpre(value_counts)
saveRDS(value_counts, file = "intermediate/value_counts.rds")
```

If we check these out we can see that we have a lot of weird ones - it
seems like some of the assumptions we've used to simplify the data have
messed up some rows where multiple comma separated values and/or
explanatory sentences have appeared.

We could try to salvage these but for the sake of brevity we're just
going to chop them off.

```R 
library(tidyverse)
value_counts <- readRDS("intermediate/value_counts.rds")
ok_values <- value_counts %>% filter(n>=10) %>% `[[`("value");
mdpre(ok_values)
saveRDS(ok_values, file = "intermediate/ok_values.rds")
```

Note that we can filter out the unwanted properties with a line like:

```R 
library(tidyverse)
tidied_data <- readRDS("intermediate/tidied_data.rds")
ok_values <- readRDS("intermediate/ok_values.rds")
tidied_data <- tidied_data %>% filter(value %in% ok_values);
saveRDS(tidied_data, file = "intermediate/tidied_data.rds")
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
you want all the points in a data set which are less than some euclidean
distance from one another. This is a cross join and a filter. But if you
need to do this for a very large data set you will need a custom data
structure or database.

Note that a join can *make your data set bigger* if matching key columns
appear more than once in the left or right table.

Joins are all over the place: they occur in dplyr, pandas and sql. They
are quite general. Its worth developing at least a superficial
understanding.

```R 
library(tidyverse)
tidied_data <- readRDS("intermediate/tidied_data.rds")
value_counts <- readRDS("intermediate/value_counts.rds")
joined <- tidied_data %>% inner_join(value_counts, by="value");
mdpre(joined)
saveRDS(joined, file = "intermediate/joined.rds")
```

Now that we have our join we can filter our data set:

```R 
library(tidyverse)
joined <- readRDS("intermediate/joined.rds")
tidied_data <- joined %>% filter(n>10) %>% select(-n);
saveRDS(tidied_data, file = "intermediate/tidied_data.rds")
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
u
```

This dataset contains many observations per row. This can make certain
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
pivot_longer(u, cols=super_strength:super_intelligence, values_to="value", names_to="power")
```

You may notice that this is more or less how my power dataset looks.

You will need to have your data in tidy format to use ggplot
effectively.

But in our case, we really do want to compare gender and marital status,
so we want to widen (a subset) of our data.

```R 
library(tidyverse)
tidied_data <- readRDS("intermediate/tidied_data.rds")
gender_marital <- tidied_data %>%
    filter(property_name == 'gender' | property_name == 'marital_status');
saveRDS(gender_marital, file = "intermediate/gender_marital.rds")
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
gender_marital <- readRDS("intermediate/gender_marital.rds")
gender_marital %>% filter(property_name == 'gender') %>%
    group_by(character, universe) %>% tally() %>%
    arrange(desc(n));
```

Looks like our gender data is good.

```R 
library(tidyverse)
gender_marital <- readRDS("intermediate/gender_marital.rds")
marital_status_counts <- gender_marital %>%
    filter(property_name == 'marital_status') %>%
    group_by(character, universe) %>%
    tally() %>%
    arrange(desc(n));
marital_status_counts;
saveRDS(marital_status_counts, file = "intermediate/marital_status_counts.rds")
```

But it seems like we have a few characters with multiple marital
statuses. Let's filter them out.

```R 
library(tidyverse)
gender_marital <- readRDS("intermediate/gender_marital.rds")
marital_status_counts <- readRDS("intermediate/marital_status_counts.rds")
gender_marital <- gender_marital %>%
    left_join(marital_status_counts, by=c("character","universe")) %>%
    filter(n == 1) %>%
    select(-n);
saveRDS(gender_marital, file = "intermediate/gender_marital.rds")
```

And now we can check whether we got it right.

```R 
library(tidyverse)
gender_marital <- readRDS("intermediate/gender_marital.rds")
gender_marital %>% filter(property_name == 'marital_status') %>%
    group_by(character, universe) %>%
    tally() %>%
    arrange(desc(n));
```

Ok. Now we can perform our widen.

```R 
library(tidyverse)
library(tidyr)
gender_marital <- readRDS("intermediate/gender_marital.rds")
gm_wider <- gender_marital %>% pivot_wider(id_cols=character:universe, names_from = 'property_name',
                               values_from='value');
saveRDS(gm_wider, file = "intermediate/gm_wider.rds")
```

And now we can get a sense for our question: does gender correlate with
marital status in comics?

```R 
library(tidyverse)
gm_wider <- readRDS("intermediate/gm_wider.rds")
status_counts <- gm_wider %>%
    group_by(gender, marital_status) %>%
    tally();
status_counts
saveRDS(status_counts, file = "intermediate/status_counts.rds")
```

This isn't enough, though, we need to normalize by total number with
each gender.

```R 
library(tidyverse)
gm_wider <- readRDS("intermediate/gm_wider.rds")
gender_counts <- gm_wider %>%
    group_by(gender) %>%
    tally();
gender_counts
saveRDS(gender_counts, file = "intermediate/gender_counts.rds")
```

And now we do a join.

```R 
library(tidyverse)
status_counts <- readRDS("intermediate/status_counts.rds")
gender_counts <- readRDS("intermediate/gender_counts.rds")
status_probs <- status_counts %>%
    left_join(gender_counts, by="gender", suffix=c("",".gender")) %>%
    mutate(p=n/n.gender)

status_probs %>%
    filter(gender %in% c("male","female") & marital_status %in% c("single","married","divorced")) %>%
    arrange(desc(p));
saveRDS(status_probs, file = "intermediate/status_probs.rds")
```

We can imagine producing a series of such tables to get a sense for
whether there is anything interesting in this data. Sometimes looking at
tables is enough, but even a moderate number of things to look at can be
overwhelming.

That is why data exploration also requires the ability to make figures.
Lots of them.


::05_review_of_dplyr_tidyr:Next： Review of Dplyr & TidyR::
