import { Button } from "@/components/ui/Button";
import { GymRegistration } from "@/models/domain";
import { UserPlus } from "lucide-react";

interface Props {
  groupedRegs:Record<string, GymRegistration[]>,
  openRegisterModal: () => void
}

export function RegistrationsTab({ 
  groupedRegs,
  openRegisterModal
} : Props) {

  return (
    <>
    {/* Registration Box */}
      <div className="relative flex-col">
        <h2 className="text-xl mb-1 font-bold">Registrations</h2>
        <div className="border rounded-md px-3 py-2 bg-shadow shadow-md">
          {groupedRegs && Object.keys(groupedRegs).length > 0 ? (
            <>
              {Object.entries(groupedRegs).map(([groupLabel, climbers]) => (
                <div key={groupLabel} className="mb-2">
                  <h3 className="font-semibold underline mb-1">{groupLabel}</h3>
                  <ul className="ml-6 list-disc">
                    {climbers.map((c, idx) => (
                      <li key={idx}>
                        {c.climberName} – <span>{c.climberEmail}</span>
                        {" • "}
                        <span>
                          {c.feeCurrency} {(c.feeamount / 100).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
          ) : (
              <span>When a climber registers, their info will show up here!</span>
          )}
        </div>
        <Button 
          className="mt-3"
          onClick={openRegisterModal}
        >
            <UserPlus size={18} />
            <span className="relative top-[1px]">Register a Climber</span>
        </Button>
      </div>
    </>
  );
}
