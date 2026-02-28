package com.cruxpass.dtos;

import com.cruxpass.models.GroupRefs.GroupRefEmbeddable;

public record HeatGroupProjection(
    Long heatId, 
    GroupRefEmbeddable group
) {}
