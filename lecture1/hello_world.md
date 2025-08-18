Hello Bios 512
==============

# BIOS512: Data Science Basics — Draft Syllabus

This course introduces reproducible data science practices using the **R** programming language. Students learn to build and communicate end-to-end data narratives, apply tidyverse packages, and practice good data science workflows including wrangling, visualization, and reporting.

Who Am I
--------

![](garth.gif)

I'm Vincent Toups. I have a PhD in Physics (my area of focus was neuroscience)
and I have worked as a public and private sector data scientist, software 
engineer, and general technical guy. 

I'm the "Chief Data Scientist for the Center for AI and Public Health," so
if you work in a lab that needs expertise in developing and deploying AI stuff
contact us.

I've never taught this couse before! But I have taught 611, which is sort of
like this course but tends to cover a lot more material, so perhaps 512
will have a pleasantly low key pace.

I'm an independent game developer:

https://featurecreeps.itch.io/corpsewizard
https://www.youtube.com/watch?v=1lynozK_DTk

And general hard to pin down weirdo. 

I'm a dad. I still think a lot about "Foundations" of physics. 

These notes are mostly from the previous lecturer but we will be putting a
Vincent Spin on things. 

Here is the course as he presented it.

---

## Course Overview and Objectives

### Description
Students will gain proficiency in R programming, data visualization, statistical literacy, and reproducible workflows. Emphasis is placed on the tidyverse ecosystem and communication of insights. Assignments are submitted via GitHub and include peer feedback and online discussions.

### Goals
By the end of the course, students will:

- Produce polished charts using `ggplot2`
- Wrangle and summarize datasets using `dplyr`
- Reshape data with `tidyr`
- Import/export data from various sources
- Work with factors and categorical variables
- Handle dates/times and perform table joins
- Employ reproducible practices: Git, Markdown, Docker
- Create a final data narrative using real-world data

### Software
- R (tidyverse)
- JupyterLab / Notebooks
- Git / GitHub
- Docker

---

## Weekly Schedule

| Lecture | Major Topics | Key Skills |
|--------|---------------|------------|
| **01 – Welcome** | Course intro, logistics | Understand expectations, join GitHub |
| **02 – JupyterLab** | Interfaces, code/Markdown cells, UI features | Navigate JupyterLab, run R code, write Markdown |
| **03 – GitHub & Markdown** | Version control, assignment workflow, Markdown basics | Use GitHub; commit, push, write docs |
| **04 – ggplot2 Basics** | Grammar of graphics, geoms, facets | Create bar charts, histograms, scatterplots |
| **05 – Distributions & Geoms** | Descriptive stats, `geom_*`, ECDFs | Compare distributions, choose geoms |
| **06 – Plot Customization** | `scale_*`, `theme_*`, `facet_*` | Customize axes, themes, palettes |
| **07 – Advanced ggplot2** | Labels, legends, dark themes | Use `labs`, design themes |
| **08 – dplyr Intro** | Split-apply-combine, basic verbs | Filter, mutate, group, summarise |
| **09 – Data Import/Export** | CSV/TSV/JSON, Google Sheets, Excel | Read/write text and spreadsheet data |
| **10 – Tibbles & Functions** | Data frames vs tibbles, writing functions | Use `pull()`, write named-arg functions |
| **11 – Data Types & Factors** | Vectors, `forcats`, reading CSVs | Reorder factors, parse types |
| **12 – Reshaping with tidyr** | `pivot_longer`, `pivot_wider`, tidy data | Reshape data, tidy principles |
| **13 – Joins, Dates, Review** | `*_join`, `lubridate`, `gganimate` | Join tables, animate plots, review syntax |
| **14 – ML & Interactivity** | `caret`, `plotly`, Dockerfiles | Build models, interactive plots |
| **15 – Pivot Review** | `pivot_longer` vs `gather`, deployment | Practice reshaping, deploy notebooks |
| **16 – Regex & Extract** | `extract()`, regex patterns | Split columns using regex |
| **17 – Shell & Binder** | Shell commands, Binder environments | Use `ls`, `mkdir`, launch Binder |
| **18 – Git & Docker Install** | Install and verify tools, `docker run` | Run RStudio/Jupyter in Docker |
| **19 – Public Data** | Open data repositories | Explore external datasets |
| **20 – Docker Images** | Registries, `install.packages()`, `pip`, `CMD` | Build custom containers, manage packages |
| **21 – Final Project** | Project instructions, example narratives | Wrangle, visualize, narrate, report |

---

## Assignments and Grading

- **Weekly exercises** following most lectures
- **Final project** demonstrating wrangling, visualization, and storytelling
- **Submission** via GitHub pull requests
- **Grading** based on correctness, clarity, reproducibility

---

## Additional Resources

- [ggplot2 cheat sheet](https://rstudio.github.io/cheatsheets/): chart types, aesthetics
- [`forcats` documentation](https://forcats.tidyverse.org): factor manipulation
- [tidyexplain GIFs](https://tidyexplain.rbind.io): tidy data animations
- [Public data portals](https://github.com/chuckpr/BIOS512): see Lecture 19

---

## Notes

This draft syllabus summarizes the content extracted from the BIOS512 lecture notebooks. Instructors may adapt pacing, add assignments, and supplement material as needed.

I want to say a bit about ::what_datascientist:What a data scientist even is.::

