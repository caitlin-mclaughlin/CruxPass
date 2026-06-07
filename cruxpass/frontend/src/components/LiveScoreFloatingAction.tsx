import { useEffect, useMemo, useState } from "react";
import { ClipboardPenLine } from "lucide-react";
import AddScoresModal from "@/components/modals/AddScoresModal";
import FloatingActionButton from "@/components/ui/FloatingActionButton";
import { AccountType } from "@/constants/enum";
import { ClimberCompetitionProvider } from "@/context/ClimberCompetitionContext";
import { useAuth } from "@/context/AuthContext";
import { useClimberSession } from "@/context/ClimberSessionContext";
import { CompetitionEntity } from "@/models/domain";
import { PublicRegistrationDto } from "@/models/dtos";
import { getRegistrationsForCompetition } from "@/services/globalCompetitionService";

type LiveScoreFloatingActionProps = {
  competition?: CompetitionEntity | null;
  registrations?: PublicRegistrationDto[];
  fixed?: boolean;
  className?: string;
};

function isActiveHeatRegistration(registration: PublicRegistrationDto) {
  if (!registration.heat?.startTime || !registration.heat.duration) return false;

  const start = new Date(registration.heat.startTime).getTime();
  const end = start + registration.heat.duration * 60_000;
  const now = Date.now();

  return now >= start && now <= end;
}

export function LiveScoreFloatingAction({
  competition,
  registrations,
  fixed = true,
  className,
}: LiveScoreFloatingActionProps) {
  const { accountType, token } = useAuth();
  const { climber, dependents } = useClimberSession();
  const [open, setOpen] = useState(false);
  const [fetchedRegistrations, setFetchedRegistrations] = useState<PublicRegistrationDto[]>([]);

  const householdIds = useMemo(() => {
    if (!climber) return [];
    return [climber.id, ...(dependents ?? []).map(dep => dep.id)];
  }, [climber, dependents]);

  useEffect(() => {
    if (
      registrations ||
      !competition?.id ||
      !token ||
      accountType !== AccountType.CLIMBER ||
      householdIds.length === 0
    ) {
      return;
    }

    let cancelled = false;
    getRegistrationsForCompetition(competition.id)
      .then(data => {
        if (!cancelled) setFetchedRegistrations(data);
      })
      .catch(() => {
        if (!cancelled) setFetchedRegistrations([]);
      });

    return () => {
      cancelled = true;
    };
  }, [accountType, competition?.id, householdIds.length, registrations, token]);

  const activeRegistrations = useMemo(() => {
    const source = registrations ?? fetchedRegistrations;
    if (!competition || competition.compStatus !== "LIVE" || householdIds.length === 0) {
      return [];
    }

    return source.filter(registration =>
      registration.climberId != null &&
      householdIds.includes(registration.climberId) &&
      isActiveHeatRegistration(registration)
    );
  }, [competition, fetchedRegistrations, householdIds, registrations]);

  if (
    !competition ||
    !token ||
    accountType !== AccountType.CLIMBER ||
    activeRegistrations.length === 0
  ) {
    return null;
  }

  return (
    <>
      <FloatingActionButton
        onClick={() => setOpen(true)}
        label="Enter Scores"
        icon={<ClipboardPenLine size={18} />}
        fixed={fixed}
        className={className ?? "bg-highlight text-background hover:bg-highlightHover" /* default style */}
      />

      <ClimberCompetitionProvider id={competition.id}>
        <AddScoresModal
          open={open}
          onClose={() => setOpen(false)}
          gymId={competition.gymId}
          competitionId={competition.id}
          registrations={activeRegistrations}
        />
      </ClimberCompetitionProvider>
    </>
  );
}
