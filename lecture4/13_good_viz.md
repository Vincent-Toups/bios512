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
