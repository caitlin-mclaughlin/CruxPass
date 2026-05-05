package com.cruxpass.models;

import com.cruxpass.enums.PricingRuleType;
import com.cruxpass.models.GroupRefs.GroupRefEmbeddable;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
public class PricingRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JoinColumn(name = "competition_id", nullable = false)
    @ManyToOne
    private Competition competition;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PricingRuleType ruleType;

    @ElementCollection
    @CollectionTable(name = "pricing_rule_groups", joinColumns = @JoinColumn(name = "pricing_rule_id"))
    @AttributeOverrides({
        @AttributeOverride(name = "type", column = @Column(name = "group_type")),
        @AttributeOverride(name = "defaultKey", column = @Column(name = "group_default_key")),
        @AttributeOverride(name = "customGroupId", column = @Column(name = "group_custom_id"))
    })
    private Set<GroupRefEmbeddable> groups = new HashSet<>();

    private Integer minAge;
    private Integer maxAge;

    @Column(nullable = false)
    private Integer amount;

    @Column(nullable = false)
    private Integer priority = 100;
}
