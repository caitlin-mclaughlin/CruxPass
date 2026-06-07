import { useEffect, useState } from "react";
import { Dot } from "lucide-react";
import PageContainer from "@/components/PageContainer";
import { useLeaderboard } from "@/context/LeaderboardContext";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { displayDateTime, displayShortDateTime } from "@/utils/datetime";
import { formatAddress, formatCityState, formatGroupDivision } from "@/utils/formatters";
import { AccountType, CompetitionFormatMap, CompetitionTypeMap, DivisionEnumMap, GroupDivisionKey } from "@/constants/enum";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { getSummaryDefaultGroups, getSummaryDivisions, summarizeHeats } from "@/utils/competitionSummary";
import PricingRulesDisplay from "@/components/ui/comp_display/PriceRuleDisplay";
import { HeatListResponsive } from "@/components/ui/heat_display/HeatListResponsive";
import { RoutesTab } from "./tabs/RoutesTab";
import { getRoutesForCompetition } from "@/services/globalCompetitionService";
import { Route } from "@/models/domain";
import { useAuth } from "@/context/AuthContext";
import { useClimberSession } from "@/context/ClimberSessionContext";
import { Button } from "@/components/ui/Button";
import RegisterModal from "@/components/modals/RegisterModal";
import { LiveScoreFloatingAction } from "@/components/LiveScoreFloatingAction";
import { createStripeCheckoutSession } from "@/services/stripeService";

export default function PublicCompetitionPage() {
  const { competition, registrations, scores, leaderboardLoading, error, refreshRegistrations } = useLeaderboard();
  const { accountType, token } = useAuth();
  const { climber, dependents } = useClimberSession();
  const [activeTab, setActiveTab] = useState<"overview" | "heats" | "routes" | "registrations" | "leaderboard">("overview");
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerDependentOnly, setRegisterDependentOnly] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    if (!competition?.id || activeTab !== "routes") return;

    setRoutesLoading(true);
    getRoutesForCompetition(competition.id)
      .then(data => setRoutes(data))
      .catch(() => setRoutes([]))
      .finally(() => setRoutesLoading(false));
  }, [activeTab, competition?.id]);

  if (leaderboardLoading) {
    return (
      <PageContainer>
        <div>Loading competition...</div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div>Error loading competition: {error.message}</div>
      </PageContainer>
    );
  }

  if (!competition) {
    return (
      <PageContainer>
        <div>Competition not found</div>
      </PageContainer>
    );
  }

  const tabStyle = (active: boolean) =>
    `text-xl font-bold ${
      active
        ? "border-b-2 border-green"
        : "border-b-2 text-prompt border-transparent hover:text-select"
    }`;

  const groups = getSummaryDefaultGroups(competition);
  const groupLabels = (competition.selectedGroups ?? []).map(group => group.name).filter(Boolean);
  const divisions = getSummaryDivisions(competition);
  const heatSnapshotParts = summarizeHeats(competition);
  const householdIds = [climber?.id, ...(dependents ?? []).map(dep => dep.id)].filter(
    (id): id is number => typeof id === "number"
  );
  const householdRegistrations = registrations.filter(registration =>
    registration.climberId != null && householdIds.includes(registration.climberId)
  );
  const pendingRegistration = householdRegistrations.find(registration =>
    registration.paid === false || registration.paymentStatus === "PENDING"
  );
  const paidRegistration = householdRegistrations.find(registration =>
    registration.paid === true || registration.paymentStatus === "PAID"
  );
  const canRegister = Boolean(token && accountType === AccountType.CLIMBER && climber && householdRegistrations.length === 0);
  const hasUnregisteredDependent = (dependents ?? []).some(dep =>
    !householdRegistrations.some(registration => registration.climberId === dep.id)
  );
  const canRegisterDependent = Boolean(
    token &&
    accountType === AccountType.CLIMBER &&
    climber &&
    householdRegistrations.some(registration => registration.climberId === climber.id) &&
    hasUnregisteredDependent
  );

  async function completePayment() {
    if (!pendingRegistration) return;

    try {
      setPaymentError(null);
      const currentUrl = window.location.href.split("?")[0];
      const session = await createStripeCheckoutSession(
        pendingRegistration.id,
        `${currentUrl}?payment=success`,
        `${currentUrl}?payment=cancel`
      );
      if (session.sessionUrl) {
        window.location.assign(session.sessionUrl);
      }
    } catch {
      setPaymentError("Unable to start payment checkout. Please try again.");
    }
  }

  function openRegistration(dependentOnly = false) {
    setRegisterDependentOnly(dependentOnly);
    setShowRegisterModal(true);
  }

  return (
    <PageContainer header={true}>
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold mb-2">{competition.name}</h1>
        <div className="flex flex-wrap items-center justify-center font-semibold text-sm gap-4">
          <StatusBadge compStatus={competition.compStatus} className="" />
          <div className="flex flex-wrap items-center justify-center font-semibold text-sm gap-4 opacity-80">
            <Dot size={18} />
            <div>
              <span className="inline lg:hidden">{displayShortDateTime(competition.startDate)}</span>
              <span className="hidden lg:inline">{displayDateTime(competition.startDate)}</span>
            </div>
            <Dot size={18} />
            <div>
              <span className="inline sm:hidden text-muted">{competition.hostGymName}</span>
              <span className="hidden sm:inline lg:hidden">{competition.hostGymName} - {formatCityState(competition.location)}</span>
              <span className="hidden lg:inline">{competition.hostGymName} - {formatAddress(competition.location)}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        {token && accountType === AccountType.CLIMBER && (
          <div className="flex flex-wrap items-center justify-end gap-3 mt-4">
            {canRegister && (
              <button
                type="button"
                className="inline-flex h-9 items-center gap-2 rounded-md bg-green px-3 py-2 text-md font-semibold text-background shadow-md hover:bg-select"
                onPointerDown={() => openRegistration(false)}
                onFocus={() => openRegistration(false)}
                onClick={() => openRegistration(false)}
              >
                Register
              </button>
            )}
            {canRegisterDependent && (
              <button
                type="button"
                className="inline-flex h-9 items-center gap-2 rounded-md bg-green px-3 py-2 text-md font-semibold text-background shadow-md hover:bg-select"
                onPointerDown={() => openRegistration(true)}
                onFocus={() => openRegistration(true)}
                onClick={() => openRegistration(true)}
              >
                Register Dependent
              </button>
            )}
            {pendingRegistration && (
              <Button onClick={completePayment}>Complete Payment</Button>
            )}
            {pendingRegistration && paidRegistration && (
              <div className="text-sm text-muted">Registration is already marked paid.</div>
            )}
            {paymentError && (
              <div className="text-sm text-accent">{paymentError}</div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-2 mb-4">
          <div className="flex gap-6" role="tablist" aria-label="Competition sections">
            <button type="button" role="tab" aria-selected={activeTab === "overview"} onClick={() => setActiveTab("overview")} className={tabStyle(activeTab === "overview")}>
              Overview
            </button>
            <button type="button" role="tab" aria-selected={activeTab === "heats"} onClick={() => setActiveTab("heats")} className={tabStyle(activeTab === "heats")}>
              Heats
            </button>
            <button type="button" role="tab" aria-selected={activeTab === "routes"} onClick={() => setActiveTab("routes")} className={tabStyle(activeTab === "routes")}>
              Routes
            </button>
            <button type="button" role="tab" aria-selected={activeTab === "registrations"} onClick={() => setActiveTab("registrations")} className={tabStyle(activeTab === "registrations")}>
              Registrations
            </button>
            <button type="button" role="tab" aria-selected={activeTab === "leaderboard"} onClick={() => setActiveTab("leaderboard")} className={tabStyle(activeTab === "leaderboard")}>
              Leaderboard
            </button>
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="border rounded-md px-3 py-2 bg-shadow shadow-md grid [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] gap-3">
              <div>
                <div className="font-medium">Date & Time:</div>
                <div>{displayDateTime(competition.startDate)}</div>
              </div>
              <div>
                <div className="font-medium">Registration Deadline:</div>
                <div>{displayDateTime(competition.deadline)}</div>
              </div>
              <div>
                <div className="font-medium">Location:</div>
                <div>{formatAddress(competition.location).split("\n").map((line, idx) => <div key={idx}>{line}</div>)}</div>
              </div>
              <div>
                <div className="font-medium">Host Gym:</div>
                <div>{competition.hostGymName}</div>
              </div>
              <div>
                <div className="font-medium">Format:</div>
                <div>{CompetitionFormatMap[competition.compFormat as keyof typeof CompetitionFormatMap]}</div>
              </div>
              <div>
                <div className="font-medium">Type(s):</div>
                <div>{competition.types.map(t => CompetitionTypeMap[t as keyof typeof CompetitionTypeMap]).join(", ")}</div>
              </div>
            </div>

            <div className="rounded-md shadow-md border px-3 py-2 bg-shadow">
              <h2 className="text-xl font-bold mb-1">Eligible Competitor Groups</h2>
              <div>{groupLabels.length > 0 ? groupLabels.join(", ") : "—"}</div>
            </div>

            <div className="rounded-md shadow-md border px-3 py-2 bg-shadow">
              <h2 className="text-xl font-bold mb-1">Divisions</h2>
              <div>{divisions.map(t => DivisionEnumMap[t as keyof typeof DivisionEnumMap]).join(", ") || "—"}</div>
            </div>

            <div className="rounded-md shadow-md border px-3 py-2 bg-shadow">
              <h2 className="text-xl font-bold mb-1">Heat Snapshot</h2>
              <div>{heatSnapshotParts.length > 0 ? heatSnapshotParts.join(" • ") : "Heat details available after registration."}</div>
            </div>

            <PricingRulesDisplay
              pricingType={competition.pricingType}
              flatFee={competition.flatFee}
              feeCurrency={competition.feeCurrency}
              pricingRules={competition.pricingRules}
            />
          </div>
        )}

        {activeTab === "heats" && (
          <HeatListResponsive
            heats={competition.heats}
            customGroups={competition.selectedGroups}
            showDate={false}
          />
        )}

        {activeTab === "routes" && (
          <RoutesTab
            routes={routes}
            loading={routesLoading}
            routeGradesVisible={competition.routeGradesVisible ?? true}
            editable={false}
          />
        )}

        {activeTab === "registrations" && (
          <div className="rounded-md shadow-md border px-3 py-2 bg-shadow">
            <h2 className="text-xl font-bold mb-1">Registrations</h2>
            {registrations.length > 0 ? (
              <ul className="ml-6 list-disc">
                {registrations.map((registration, index) => (
                  <li key={`${registration.climberName}-${index}`}>
                    {registration.climberName}
                    {" • "}
                    {registration.competitorGroup.name}
                    {" • "}
                    {DivisionEnumMap[registration.division as keyof typeof DivisionEnumMap]}
                  </li>
                ))}
              </ul>
            ) : (
              <span>Registered climbers will appear here.</span>
            )}
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div>
            {groups.map(group =>
              divisions.map(division => {
                const key = `${group}-${division}` as GroupDivisionKey;
                return (
                  <div key={key} className="mb-6">
                    <h2 className="text-lg font-semibold">{formatGroupDivision(group, division)}</h2>
                    <LeaderboardTable submissions={scores[key]} group={group} division={division} />
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <RegisterModal
        open={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        competition={competition}
        dependentOnly={registerDependentOnly}
        onSuccess={async () => {
          await refreshRegistrations(competition.id);
          setShowRegisterModal(false);
        }}
      />

      {token && accountType === AccountType.CLIMBER && (
        <>
          <LiveScoreFloatingAction
            competition={competition}
            registrations={registrations as any}
            fixed={false}
            className="mt-3 bg-highlight text-background hover:bg-highlightHover"
          />
        </>
      )}
    </PageContainer>
  );
}
