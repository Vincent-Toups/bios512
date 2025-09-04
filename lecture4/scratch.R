library(tidyverse);

data <- read_csv("source_data/NYC_Dog_Licensing_Dataset_20240917.csv")
pr <- problems(data) %>% pull(row)
problematic_data  <- data %>% filter(row_number() %in% pr)

data %>% group_by(AnimalBirthYear) %>% tally()

cc_data <- data %>% filter(complete.cases(.) & AnimalName != "." & AnimalName != "A")

cat(sprintf("Before removing incomplete cases there were %d rows and now there are %d rows.\n (%d removed)",
            nrow(data), nrow(cc_data),
            nrow(data)-nrow(cc_data)));



registrations_per_year <- cc_data %>% group_by(AnimalBirthYear) %>% tally()

ggplot(cc_data, aes(AnimalBirthYear)) + geom_histogram(stat="count") + xlim(1990, 2024);

cc_data %>% group_by_all() %>% tally() %>% filter(n>1)



