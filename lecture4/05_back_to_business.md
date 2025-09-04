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
source("prop_table.R")

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


::06_joins:Next∶ Joins::
