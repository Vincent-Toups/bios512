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


::10_ggplot_concepts:Next∶ ggplot concepts::
