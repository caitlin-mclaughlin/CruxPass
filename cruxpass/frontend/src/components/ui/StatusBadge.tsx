import { CompetitionStatus } from "@/constants/enum";
import { cn } from "@/lib/utils";

interface Props {
  compStatus: CompetitionStatus | string,
  className?: string
}

export function StatusBadge({compStatus, className} : Props) {
  const baseStyle = "flex items-center rounded-full text-background text-center tracking-[0.1em] font-semibold bg-green py-1 px-3";
  const badgeStyle = () => {
    switch(compStatus) {
      case 'UPCOMING':
        return cn("bg-highlight", baseStyle, className);
      case 'LIVE':
        return cn("bg-highlightAccent", baseStyle, className);
      case 'FINISHED':
        return cn("bg-accent", baseStyle, className);
      default:
        return cn(baseStyle, className);
    }
  };

  return (
    <div className={badgeStyle()}>
      <span className="relative top-[1px]">{compStatus}</span>
    </div>
  )
}