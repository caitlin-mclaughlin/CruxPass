package com.cruxpass.models.GroupRefs;

import com.cruxpass.enums.DefaultCompetitorGroup;

public record DefaultGroupRef(
    DefaultCompetitorGroup key
) implements GroupRef {}