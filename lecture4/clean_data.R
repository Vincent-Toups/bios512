library(dplyr);
library(readr);

df <- read_csv("source_data/character-data.csv", col_types = cols(
  character = col_character(),
  universe = col_character(),
  property_name = col_character(),
  value = col_character()
  ))

just_gender <- filter(df, property_name=="Gender")
