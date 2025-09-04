## ggplot concepts

GGPLOT Trinity:

1. Data (one row per observation)
2. Geometry (something we see)
3. Aesthetics (properties of geometries)


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
```sidebar
Note that in recent versions of R the pipe operator has been added to the
language in the form of `|>`. They mean the same thing. 
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


::11_geometries:Next∶ GGPlot Geometries::
