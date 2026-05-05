package com.cruxpass.services;

import java.time.LocalDate;
import java.time.Period;
import java.util.Comparator;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.cruxpass.enums.PricingRuleType;
import com.cruxpass.enums.PricingType;
import com.cruxpass.enums.GroupRefType;
import com.cruxpass.models.Climber;
import com.cruxpass.models.Competition;
import com.cruxpass.models.PricingRule;
import com.cruxpass.models.GroupRefs.GroupRefEmbeddable;

@Service
public class CompetitionPricingService {

    public record PricingQuote(
        Integer amount,
        String currency
    ) {}

    public PricingQuote quoteFor(
        Competition competition,
        Climber climber,
        GroupRefEmbeddable groupRef
    ) {
        if (competition == null) {
            return new PricingQuote(0, "USD");
        }

        String currency = competition.getFeeCurrency() == null || competition.getFeeCurrency().isBlank()
            ? "USD"
            : competition.getFeeCurrency();

        PricingType pricingType = competition.getPricingType();
        if (pricingType == null || pricingType == PricingType.FLAT) {
            return new PricingQuote(
                competition.getFlatFee() == null ? 0 : competition.getFlatFee(),
                currency
            );
        }

        if (pricingType == PricingType.BY_GROUP) {
            PricingRule matched = competition.getPricingRules().stream()
                .filter(r -> r.getRuleType() == PricingRuleType.GROUP)
                .sorted(Comparator.comparing(PricingRule::getPriority))
                .filter(r -> groupRefMatches(r, groupRef))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No pricing rule for selected competitor group."
                ));
            return new PricingQuote(matched.getAmount(), currency);
        }

        int age = calculateAge(climber, competition);
        PricingRule matched = competition.getPricingRules().stream()
            .filter(r -> r.getRuleType() == PricingRuleType.AGE)
            .sorted(Comparator.comparing(PricingRule::getPriority))
            .filter(r -> ageMatches(r, age))
            .findFirst()
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "No pricing rule for climber age."
            ));
        return new PricingQuote(matched.getAmount(), currency);
    }

    private int calculateAge(Climber climber, Competition competition) {
        if (climber == null || climber.getDob() == null) return 0;
        LocalDate asOf = competition.getStartDate() != null
            ? competition.getStartDate().toLocalDate()
            : LocalDate.now();
        return Math.max(0, Period.between(climber.getDob(), asOf).getYears());
    }

    private boolean ageMatches(PricingRule rule, int age) {
        Integer min = rule.getMinAge();
        Integer max = rule.getMaxAge();
        if (min != null && age < min) return false;
        if (max != null && age > max) return false;
        return true;
    }

    private boolean groupRefMatches(PricingRule rule, GroupRefEmbeddable groupRef) {
        Set<GroupRefEmbeddable> groups = rule.getGroups();
        return groups != null && groups.stream().anyMatch(ref -> groupRefEquals(ref, groupRef));
    }

    private boolean groupRefEquals(GroupRefEmbeddable left, GroupRefEmbeddable right) {
        if (left == null || right == null || left.getType() != right.getType()) return false;
        if (left.getType() == GroupRefType.DEFAULT) {
            return left.getDefaultKey() != null && left.getDefaultKey() == right.getDefaultKey();
        }
        return left.getCustomGroupId() != null && left.getCustomGroupId().equals(right.getCustomGroupId());
    }
}
