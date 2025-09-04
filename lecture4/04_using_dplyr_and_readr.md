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


::05_back_to_business:Next∶ Back to Business::
