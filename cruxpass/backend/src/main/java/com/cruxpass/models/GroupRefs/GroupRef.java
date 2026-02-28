package com.cruxpass.models.GroupRefs;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = DefaultGroupRef.class, name = "DEFAULT"),
    @JsonSubTypes.Type(value = CustomGroupRef.class, name = "CUSTOM")
})
public sealed interface GroupRef permits DefaultGroupRef, CustomGroupRef {}
