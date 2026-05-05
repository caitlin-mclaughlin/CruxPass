package com.cruxpass.models;

import com.cruxpass.enums.Division;
import com.cruxpass.models.GroupRefs.GroupRefEmbeddable;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

@AllArgsConstructor
@Data
@Entity
@NoArgsConstructor
public class Registration {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private boolean paid;

    @Column(nullable = false)
    private Integer feeamount = 0;

    @Column(nullable = false)
    private String feeCurrency = "USD";

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "type", column = @Column(name = "competitor_group_type", nullable = false)),
        @AttributeOverride(name = "defaultKey", column = @Column(name = "competitor_group_default_key")),
        @AttributeOverride(name = "customGroupId", column = @Column(name = "competitor_group_custom_id"))
    })
    private GroupRefEmbeddable competitorGroupRef;

    @NonNull
    @Enumerated(EnumType.STRING)
    Division division;

    @JoinColumn(name = "heat_id")
    @ManyToOne
    private Heat heat;

    @JoinColumn(name = "climber_id", nullable = false)
    @ManyToOne
    private Climber climber;

    @JoinColumn(name = "competition_id", nullable = false)
    @ManyToOne
    private Competition competition;

}
