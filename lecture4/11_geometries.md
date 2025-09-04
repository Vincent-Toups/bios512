## GGPlot Geometries

GGPlot will pretty much let you do anything. You just need to find the
right geometry.

1.  geom_point - points
2.  geom_histogram - histogram, performs aggregation itself (geom_bar +
    stat bin)
3.  geom_density - density plot (using a kernel density estimate)
4.  geom_boxplot - boxplot (plots centroids and widths w/ outliers)
5.  geom_rect - general rectangles
6.  geom_bar - bar graph can perform all sorts of aggregations
7.  Many others

Aesthetics (not all aesthetics apply to all geometries)

1.  color - the color of a point or shape or the color of the boundary
    of a polygon or rectangle.
2.  fill - the color of the interior of a polygon or rectangle
3.  alpha - the transparency of a color
4.  position - for histograms and bar plots how to position boxes for
    the same x aesthetic. "dodge" is the clearest.


::12_non_trivial_example:Next∶ Non-trivial Example::
