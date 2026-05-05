import { CompetitionStatus } from "@/constants/enum";
import { cn } from "@/lib/utils";

interface Props {
  compStatus: CompetitionStatus,
  className?: string
}

export function StatusBadge({compStatus, className} : Props) {
  const baseStyle = "flex items-center rounded-full text-background text-center py-1 px-3";
  const badgeStyle = () => {
    switch(compStatus) {
      case 'UPCOMING':
        return cn("bg-green", baseStyle, className);
      case 'LIVE':
        return cn("bg-highlight", baseStyle, className);
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