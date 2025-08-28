# Common Problems With Data Sets

1.  Duplicate Data (records appear multiple times). This is a really
    deadly error because it can cause you to mix training and testing
    data and dramatically over-estimate the effectiveness of a model.

2.  Pseudo-Duplicate Data - Worse than above - this is data which is not
    strictly identical but is highly correlated with another set of
    records. Just as bad if you miss it.

3.  Missing Data - missing fields in records can cause otherwise smooth
    workflows to fail. Worse, some functions can lift missing data to
    spurious values (like 0) which can throw off statistics and models.
    There may also be a bias in which data is missing or which records
    are affected which will modify the results of summaries and
    modeling.

4.  Incorrectly encoded missing data. It isn't so uncommon to have
    missing values encoded in a variety of ways, even in a single data
    set. You might see a csv file where missing values are incoherently
    encoded like:

    ```         
    ,,"","NA","-","NULL",...
    ```

5.  Poorly encoded data dumps. CSV files (for example) are delimited
    with commas. Sometimes a database dump can dump fields which have
    strings in them which themselves contain commas. Frequently this
    will cause R to barf when it tries to read the data (or give
    warnings that the number of columns in each row is irregular). But
    sometimes you get very unlucky and it just shifts your data around
    in a bad way.

6.  Inconsistently encoded dates or values. Dates are the biggest risk
    here. The tidyverse tries to read columns that look like dates as
    dates, but it will struggled to get it right if there are subtle
    issues. Other gotchas: what time zone was this date/time referring
    to if it doesn't explicitly say? Do the times change to reflect
    daylight savings time? In which case, in what time zone?

The fact is you will encounter all of these issues with data sets in
your career and you will definitely miss some of them at some point.

Further raising the stakes is that all of these problems with data sets
can cause profound problems with your downstream data analysis. So data
cleansing (and recording the process) is among the most important steps
of any data science project.


::03_how_to_defend_yourself:Next： How to Defend Yourself::
