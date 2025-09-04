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


::08_review:Next∶ Review of Dplyr & TidyR::
