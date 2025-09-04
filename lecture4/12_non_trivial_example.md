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


::13_good_viz:Next∶ What Makes A Visualization Good?::
