---
editor_options: 
  markdown: 
    wrap: 72
---

# Introductory Notes

FINALLY we are ready to do some data-science material.

The fact is, its a very rare situation indeed that you will receive a
"clean" dataset. This might seem like a surprise to you if you are, for
instance, a scientist working in a laboratory setting on small data
sets. In those situations, data collection is quite controlled and while
outliers and unusual circumstances may prevail from time to time, the
data collected is typically small enough that data which represents
error conditions is thrown away early. With the advent of computerized
instruments, errors in recording data (which might have been done by
hand in the past) are very unusual.

But large data sets are different. Many large datasets are generated as
a side effect of some other process and consequently don't reach the
level of cleanliness we expect from lab data. A Sales Database I once
analyzed included a large number of pseudo-duplicate entries because
Salesmen were working around a technical limitation in the database
limiting the number of contracts they could work on: salesmen would
appear multiple times in the database with names like "Smith", "Smith,
Jon", "Smith, Franklin John" etc. Form entry errors for non-essential
data are also very common. A lot of data sets cover years of a
database's existence and sometimes garbage data gets in during a
so-called "database migration" where an old version of the database has
to be moved to a new version.

A good rule of thumb is that in any dataset that is too large for one
person to look at and in which the data is not actively constrained by
some reliable external process there will be errors.

There are also [other sorts of
problems](https://www.popularmechanics.com/science/a22577/genetics-papers-excel-errors/):

![](./excel_errors.png)


::02_common_problems_with_data_sets:Next： Common Problems With Data Sets::
