import { CompetitionFormatMap, CompetitionTypeMap } from "@/constants/enum";
import { CompetitionEntity } from "@/models/domain";
import { displayDateTime } from "@/utils/datetime";
import { formatAddress } from "@/utils/formatters";

interface CompPreviewCardProps {
  competition: CompetitionEntity;
  onClick?: () => void;
}

export const CompetitionPreviewCard: React.FC<CompPreviewCardProps> = ({
  competition,
  onClick,
}) => {
    const priceSummary = (() => {
      if (competition.pricingType === 'FLAT') {
        const cents = competition.flatFee ?? 0;
        const amount = (cents / 100).toFixed(2);
        return `${competition.feeCurrency} ${amount}`;
      }
      if (competition.pricingType === 'BY_AGE') {
        return `Age-based (${competition.pricingRules?.length ?? 0} rule${(competition.pricingRules?.length ?? 0) === 1 ? '' : 's'})`;
      }
      return `Group-based (${competition.pricingRules?.length ?? 0} rule${(competition.pricingRules?.length ?? 0) === 1 ? '' : 's'})`;
    })();

    return (
    <div className="border rounded-md px-3 py-2 bg-shadow shadow-md grid [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] gap-3">
      <div className="relative flex-col">
        <div className="font-medium">Date & Time:</div>
        <div>{displayDateTime(competition.startDate)}</div>
      </div>
      <div className="relative flex-col">
        <div className="font-medium">Registration Deadline:</div>
        <div>{displayDateTime(competition.deadline)}</div>
      </div>
      <div className="relative flex-col">
        <div className="font-medium">Location:</div>
        <div>{formatAddress(competition.location)
            .split("\n")
            .map((line, idx) => <div key={idx}>{line}</div>)}</div>
      </div>
      <div className="relative flex-col">
        <div className="font-medium">Host Gym:</div>
        <div>{competition.hostGymName}</div>
      </div>
      <div className="relative flex-col">
        <div className="font-medium">Format:</div>
        <div>{CompetitionFormatMap[competition.compFormat as keyof typeof CompetitionFormatMap]}</div>
      </div>
      <div className="relative flex-col">
        <div className="font-medium">Type(s):</div>
        <div>{competition.types.map(t => CompetitionTypeMap[t as keyof typeof CompetitionTypeMap]).join(', ')}</div>
      </div>
      <div className="relative flex-col">
        <div className="font-medium">Registration Pricing:</div>
        <div>{priceSummary}</div>
      </div>
    </div>
  )
}
