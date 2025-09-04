prop_table <- function(df, property){
    df %>% filter(property_name == property) %>% group_by(value) %>%
        tally() %>% arrange(desc(n));
}