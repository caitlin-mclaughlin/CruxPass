package com.cruxpass.models;

import com.cruxpass.enums.AgeRuleType;

import jakarta.annotation.Nullable;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Embeddable
@Data
public class AgeRule {

    @Enumerated(EnumType.STRING)
    @Column(name = "age_rule_type")
    private AgeRuleType type;

    @Column(name = "age_rule_min")
    @Nullable
    private Integer min;

    @Column(name = "age_rule_max")
    @Nullable
    private Integer max;
}
