import { SimpleGym } from "@/models/domain";
import { formatPhoneNumber } from "@/utils/formatters";
import React from "react";

interface GymPreviewCardProps {
  gym: SimpleGym;
  onClick?: () => void;
}

export const GymPreviewCard: React.FC<GymPreviewCardProps> = ({
  gym,
  onClick,
}) => {

  return (
    <div className="mt-4" onClick={onClick}>
      {/* outer wrapper ensures the row never forces the modal wider */}
      <div className="border border-green bg-shadow rounded-md px-3 py-1 text-green shadow-md w-full overflow-hidden">
        {/* Use grid so columns align and borders span full height.
            min-w-0 on the grid allows children to shrink and truncation to work. */}
        <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,auto)_minmax(0,107px)_minmax(0,100px)] gap-2 items-stretch min-w-0">
          {/* Gym name — wraps */}
          <div className="flex items-center border-r border-green font-semibold pr-2 break-words whitespace-normal min-w-0">
            {gym.name}
          </div>

          {/* Email — truncate and respect padding */}
          <div className="flex items-center border-r border-green text-sm font-semibold pr-2 overflow-hidden min-w-0">
            <span className="truncate">{gym.email}</span>
          </div>

          {/* Phone — truncate */}
          {gym.phone && (
              <div className="flex items-center border-r border-green text-sm font-semibold pr-2 overflow-hidden min-w-0">
              <span className="truncate">{formatPhoneNumber(gym.phone)}</span>
              </div>
          )}

          {/* City/State — wraps */}
          <div className="flex items-center text-sm font-semibold break-words whitespace-normal">
              {gym.address.city && gym.address.state
              ? `${gym.address.city}, ${gym.address.state}`
              : '-'}
          </div>
        </div>
      </div>
    </div>
  )
}