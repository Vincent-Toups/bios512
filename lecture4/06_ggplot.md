# ggplot

The `gg` in `ggplot` stands for "grammar of graphics."

```R
library(tidyverse)
# Persistence + display scaffolding for stateless execution
if (!dir.exists("intermediate")) dir.create("intermediate", recursive = TRUE)
if (!exists("mdpre")) mdpre <- function(x) { print(x) }
if (!exists("ggmd"))  ggmd  <- function(p) { print(p) }

# Recreate lightweight helpers used earlier
library(stringr)
simplify_strings <- function(s){
  s %>% str_to_lower() %>% str_trim() %>% str_replace_all("[^a-z1-9]+","_") %>%
    str_replace_all("^_+","") %>% str_replace_all("_+$","")
}

# Load prepared data if available
if (file.exists("intermediate/tidied_data.rds")) {
  tidied_data <- readRDS("intermediate/tidied_data.rds")
}
if (file.exists("intermediate/value_counts.rds")) {
  value_counts <- readRDS("intermediate/value_counts.rds")
}
```

As a teaser, lets plot the data we just calculated:

```R
library(tidyverse)
library(ggplot2)
status_probs <- readRDS("intermediate/status_probs.rds")
ggmd(ggplot(status_probs, aes(marital_status, p)) +
    geom_bar(aes(fill=gender), stat="identity", position="dodge"))

```

Already we can see how much easier this data is to consume. With just a
little more elbow grease we can have a pretty professional looking plot:

```R
library(tidyverse)
library(ggplot2)
status_probs <- readRDS("intermediate/status_probs.rds")
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
suppressPackageStartupMessages(library(ggplot2))
suppressPackageStartupMessages(library(tibble))
if (!exists("ggmd")) ggmd <- function(p) print(p)
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
suppressPackageStartupMessages(library(ggplot2))
if (!exists("ggmd")) ggmd <- function(p) print(p)
df$category <- sample(factor(c(1,2,3)),size=nrow(df),replace=T)
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
suppressPackageStartupMessages(library(ggplot2))
if (!exists("ggmd")) ggmd <- function(p) print(p)
if (file.exists("intermediate/tidied_data.rds")) tidied_data <- readRDS("intermediate/tidied_data.rds")
ggmd(ggplot(tidied_data, aes(property_name)) + geom_histogram(stat="count"));
```

Well, that is nice but its a far from ideal result. The x-axis labels
are unreadable. Let's fix that:

```R
library(tidyverse)
suppressPackageStartupMessages(library(ggplot2))
if (!exists("ggmd")) ggmd <- function(p) print(p)
if (file.exists("intermediate/tidied_data.rds")) tidied_data <- readRDS("intermediate/tidied_data.rds")
ggmd(ggplot(tidied_data, aes(property_name)) +
    geom_histogram(stat="count") +
    theme(axis.text.x = element_text(angle = 90)));
```

Note: I literally *always* google "ggplot rotate x label" for this.

This figure is still hard to read. Let's put the x axis in order by
count. To do this we need to appreciate factor variables.

Factors are what R uses when you some numerical or otherwise base data
but you want to highlight the fact that these are categorical and may
have an order. ggplot will respect the factor order if a column is a
factor variable, so lets coerce our property_name variable into a factor
based on total count.

```R
library(tidyverse)
tidied_data <- readRDS("intermediate/tidied_data.rds")
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
that roughly the number of properties of a super hero and the page
length should correlate. Very roughly.

```R
library(tidyverse)
# helper used locally
simplify_strings <- function(s){
  s <- stringr::str_to_lower(s)
  s <- stringr::str_trim(s)
  s <- stringr::str_replace_all(s, "[^a-z1-9]+", "_")
  s <- stringr::str_replace_all(s, "^_+", "")
  s <- stringr::str_replace_all(s, "_+$", "")
  s
}
page_lengths <- read_csv("source_data/character-page-data.csv");
names(page_lengths) <- simplify_strings(names(page_lengths));
page_lengths <- page_lengths %>% mutate(across(character:universe, simplify_strings));
mdpre(page_lengths)
saveRDS(page_lengths, file = "intermediate/page_lengths.rds")
```

```R
library(tidyverse)
tidied_data <- readRDS("intermediate/tidied_data.rds")
page_lengths <- readRDS("intermediate/page_lengths.rds")
property_counts <- tidied_data %>% group_by(character, universe) %>% tally(name="prop_count")
mdpre(property_counts)
saveRDS(property_counts, file = "intermediate/property_counts.rds")

df <- property_counts %>% inner_join(page_lengths, by=c("character","universe"));
ggmd(ggplot(df,aes(page_length, prop_count)) + geom_point() + labs(x="Page Length",y="Property Count"));
saveRDS(df, file = "intermediate/propcount_pagelen.rds")
```

How does this data interact with gender? Let's pull out the gender data
and join it to our data set.

```R
library(tidyverse)
gender_data <- tidied_data %>% filter(property_name=="gender") %>%
    rename(gender=value) %>%
    select(-property_name);
mdpre(gender_data)
saveRDS(gender_data, file = "intermediate/gender_data.rds")

df <- property_counts %>% inner_join(page_lengths, by=c("character","universe")) %>%
    inner_join(gender_data, by=c("character","universe"));

ggmd(ggplot(df,aes(page_length, prop_count)) + geom_point(aes(color=gender)) + labs(x="Page Length",y="Property Count"));
saveRDS(df, file = "intermediate/propcount_pagelen_gender.rds")

```

We see here a pretty common problem with scatter plots: when the points
lie on top of one another its hard to see what is going on. We can take
a few approaches to solving this. Here is a quick and dirty one:

```R
library(tidyverse)
suppressPackageStartupMessages(library(ggplot2))
if (!exists("ggmd")) ggmd <- function(p) print(p)
if (file.exists("intermediate/propcount_pagelen_gender.rds")) {
  df <- readRDS("intermediate/propcount_pagelen_gender.rds")
}
ggmd(ggplot(df,aes(page_length, prop_count + 0.75*runif(nrow(df)))) +
    geom_point(aes(color=gender)) +
    labs(x="Page Length",y="Property Count"));

```

Still sort of bad:

```R
library(tidyverse)
suppressPackageStartupMessages(library(ggplot2))
if (!exists("ggmd")) ggmd <- function(p) print(p)
if (file.exists("intermediate/propcount_pagelen_gender.rds")) {
  df <- readRDS("intermediate/propcount_pagelen_gender.rds")
}
ggmd(ggplot(df,aes(page_length, prop_count + 0.75*runif(nrow(df)))) +
    geom_point(aes(color=gender),alpha=0.3) +
    labs(x="Page Length",y="Property Count"));

```

This might call for a box plot.

```R
library(tidyverse)
suppressPackageStartupMessages(library(ggplot2))
if (!exists("ggmd")) ggmd <- function(p) print(p)
if (file.exists("intermediate/propcount_pagelen_gender.rds")) {
  df <- readRDS("intermediate/propcount_pagelen_gender.rds")
}
ggmd(ggplot(df %>% filter(page_length > 3.75e5) %>% filter(gender %in% c("male","female")), aes(factor(prop_count),page_length)) +
    geom_boxplot(aes(color=gender)) + ylim(3.75e5,500000));

```

Looking at this data tells us a few things.

1.  There is a trend for female-coded characters have shorter pages.
2.  The data is very not-normal, probably reflecting some missing
    componenets in our understanding of the data.

Let's take a look at just that question using a density plot.

suppressPackageStartupMessages(library(ggplot2))
if (!exists("ggmd")) ggmd <- function(p) print(p)
if (file.exists("intermediate/propcount_pagelen_gender.rds")) {
  df <- readRDS("intermediate/propcount_pagelen_gender.rds")
}
```R
library(tidyverse)
ggmd(ggplot(df %>%
       filter(page_length < 500000 & gender %in% c("male",
                                                   "female")),
       aes(page_length)) + geom_density(aes(fill=gender),
                                        alpha=0.5));
```

Not all that enlightening.

```R
library(tidyverse)
suppressPackageStartupMessages(library(ggplot2))
if (!exists("ggmd")) ggmd <- function(p) print(p)
if (file.exists("intermediate/propcount_pagelen_gender.rds")) {
  df <- readRDS("intermediate/propcount_pagelen_gender.rds")
}
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
suppressPackageStartupMessages(library(ggplot2))
if (!exists("ggmd")) ggmd <- function(p) print(p)
if (file.exists("intermediate/propcount_pagelen_gender.rds")) {
  df <- readRDS("intermediate/propcount_pagelen_gender.rds")
}
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
    the same x aesthetic. "dodge" is the most clear.

## Non-trivial Example

Let's try to appreciate whether powers are distributed difference
between male and female characters. This is a figure which will be
merely suggestive rather than statistically meaningful. We will examine
*rank* rather than difference.

```R
library(tidyverse)
powers <- read_csv("source_data/powers.csv");
powers <- powers %>% mutate(across(power:universe, simplify_strings)) %>%
    distinct();

powers_gender <- powers %>% inner_join(gender_data, by=c("character", "universe")) %>%
    select(-url) %>%
    filter(gender %in% c("male","female"));
mdpre(powers_gender)
saveRDS(powers_gender, file = "intermediate/powers_gender.rds")

```

We want to calculate for each power `P(power|gender)`.

```R
library(tidyverse)
gender_counts <- gender_data %>% group_by(gender) %>% tally(name="total");
probs <- powers_gender %>%
    inner_join(gender_counts, by="gender") %>%
    group_by(power, gender, total)  %>% 
    summarize(p=length(character)/total[[1]]) %>%
    arrange(gender,desc(p)) %>%
    group_by(gender) %>%
    mutate(rank=seq(length(p))) %>%
    ungroup();
probs
```

```R
library(tidyverse)
probs %>% filter(gender=="male")
```

Let's just keep the first 20 powers.

```R
library(tidyverse)
ranked_gendered <- probs %>% filter(rank<=20) %>% select(-p,-total);
ranked_gendered

power_order <- ranked_gendered %>% group_by(power) %>% summarize(mr = mean(rank)) %>%
    arrange(mr) %>% `[[`("power")

ranked_gendered$power <- factor(ranked_gendered$power,power_order);

```

We want a totally custom plot here. On the left we want to have the
female powers and the male powers on the right.

```R
library(tidyverse)
gender_to_x <- function(g){
    x=c("male"=1,"female"=-1)
    x[g];
}

ggplot(ranked_gendered) +
    geom_rect(aes(xmin=gender_to_x(gender)-0.5,
              xmax=gender_to_x(gender)+0.5,
              ymin=21-rank-0.45,
              ymax=21-rank+0.45,
              fill=power)) +
    geom_text(aes(x=gender_to_x(gender),
                  y=21-rank,
                  label=power));
```

This is nice but lets put a litlte more polish on this and add lines
connecting the same power on each side. This will require massaging our
data a little.

```R
library(tidyverse)
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


```

Note that we can use multiple data sets per plot:

```R
library(tidyverse)


ggplot(ranked_gendered) +
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
    labs(x="Sex Presentation",y="Rank", title="Are superpowers distributed differently by presented sex?");

```


::07_what_makes_a_visualization_good:Next： What Makes A Visualization Good?::
