/*
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useClimberSession } from "@/context/ClimberSessionContext";
import { useGymSession } from "@/context/GymSessionContext";

import { formatAddress, formatDate, formatPhoneNumber } from "@/utils/formatters";
import { MAX_AGE, MIN_AGE } from "@/constants/literal";
import { AccountType, GENDER_OPTIONS, GenderEnumMap } from "@/constants/enum";

import CustomRadioGroup from "@/components/ui/CustomRadioGroup";
import { UserPen } from "lucide-react";
import SegmentedDateInput from "@/components/ui/SegmentedDateInput";
import { Input } from "@/components/ui/Input";
import { ClimberData, GymData, SeriesData } from "@/models/domain";
import { Button } from "@/components/ui/Button";
import { useSeriesSession } from "@/context/SeriesSessionContext";
import { makeDateChangeHandler, normalizeBackendDateOrDateTime } from "@/utils/datetime";

export default function ProfilePage() {
  const { token } = useAuth();
  const { climber, updateClimberProfile, refreshClimber } = useClimberSession();
  const { gym, updateGymProfile, refreshGym} = useGymSession();
  const { series, updateSeriesProfile, refreshSeries } = useSeriesSession()

  const [profileType, setProfileType] = useState<AccountType | null>(null);
  const [formData, setFormData] = useState<ClimberData | GymData | SeriesData>();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const minDob = new Date(today.getFullYear() - MAX_AGE, today.getMonth(), today.getDate());
  const maxDob = new Date(today.getFullYear() - MIN_AGE, today.getMonth(), today.getDate());

  // Fetch profile using context + services
  useEffect(() => {
    if (!token) return;

    if (climber) {
      setProfileType(AccountType.CLIMBER);
      setFormData(climber);
      setLoading(false);
      console.log("Loaded climber profile data:", climber.name);
    } else if (gym) {
      setProfileType(AccountType.GYM);
      setFormData(gym);
      setLoading(false);
      console.log("Loaded gym profile data:", gym.name);
    } else if (series) {
      setProfileType(AccountType.SERIES);
      setFormData(series);
      setLoading(false);
      console.log("Loaded series profile data:", series.name);
    }

  }, [token, climber, gym, series]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData((prev: any) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    setFormData((prev: any) => ({
      ...prev,
      dob: date,
    }));
  };

  const handleSubmit = async () => {
    if (!formData) return
    if ('dob' in formData) {
      const dobDate = new Date(formData.dob);
      const age = today.getFullYear() - dobDate.getFullYear();
      if (age < MIN_AGE || age > MAX_AGE) {
        alert(`Date of birth must be between ages ${MIN_AGE} and ${MAX_AGE}`);
        return;
      }
    }

    try {
      if (profileType === AccountType.CLIMBER && 'dob' in formData) {
        await updateClimberProfile(formData);
      } else if (profileType === AccountType.GYM && 'address' in formData) {
        await updateGymProfile(formData);
      } else {
        await updateSeriesProfile(formData);
      }
      setEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Profile update failed.");
    }
  };

  if (loading) return <div className="h-screen p-8 bg-background text-green">Loading...</div>;
  if (!formData && !climber && !gym && !series) return <div className="h-screen p-8 bg-background text-green">No profile found.</div>;

  const renderInput = (label: string, name: string, value: any) => (
    <>
      <div className="font-medium text-green">{label}</div>
      <div className="text-green">
        {editing ? (
          <Input
            name={name}
            value={value || ""}
            onChange={handleChange}
            className="bg-background border-b border-green shadow-md outline-none w-full"
          />
        ) : (
          value
        )}
      </div>
    </>
  );

  return (
    <div className="h-screen p-8 bg-background text-green">
      <h1 className="text-2xl font-bold mb-2">
        {profileType === AccountType.CLIMBER
          ? 'Climber Profile'
          : profileType === AccountType.GYM
          ? 'Gym Profile'
          : 'Series Profile'}
      </h1>

      <div className="grid grid-cols-2 gap-y-3 max-w-md rounded-md shadow -md px-3 py-2 bg-shadow border border-green">
        {/* Name 
        {renderInput(
          profileType === AccountType.CLIMBER ? 'Name:' : 
          profileType === AccountType.GYM ? 'Gym Name:' :
          'Series Name',
          'name', formData?.name
        )}
        {/* Email 
        {renderInput('Email:', 'email', formData?.email)}
        {/* Phone only for climber and gym 
        {profileType !== AccountType.SERIES && formData && 'phone' in formData &&
          renderInput('Phone:', 'phone', formatPhoneNumber(formData.phone ?? ''))
        }
        {/* Username 
        {renderInput('Username:', 'username', formData?.username)}

        {/* DOB and Gender only for climber 
        {profileType === AccountType.CLIMBER && formData && 'dob' in formData && (
          <>
            <div className="font-medium text-green">Date of Birth:</div>
            <div className="text-green">
              {editing ? (
                <div className="w-full bg-background border rounded-md shadow-md">
                  <SegmentedDateInput
                    mode="birthday"
                    onChange={makeDateChangeHandler<ClimberData>("dob", setFormData)}
                    value={normalizeBackendDateOrDateTime(formData.dob)}
                  />
                </div>
              ) : (
                formatDate(new Date(formData.dob + "T00:00:00"))
              )}
            </div>

            <div className="font-medium text-green">Gender (Division):</div>
            <div className="text-green">
              {editing ? (
                <CustomRadioGroup
                  name="division"
                  options={GENDER_OPTIONS.map(g => ({ 
                    value: g, 
                    label: GenderEnumMap[g as keyof typeof GenderEnumMap] 
                  }))}
                  selected={formData.division}
                  onChange={(g: string) => {
                    setFormData((prev: any) => ({ 
                      ...prev, 
                      division: g
                    }))
                  }}
                />
              ) : (
                GenderEnumMap[formData.division as keyof typeof GenderEnumMap] || ''
              )}
            </div>
          </>
        )}

        {/* Address only for climber and gym 
        {profileType !== AccountType.SERIES && formData && 'address' in formData && (
          <>
            <div className="font-medium text-green">Address:</div>
            <div className="text-green">
              {editing ? (
                <div className="grid grid-cols-1 gap-2">
                  <Input
                    name="address.streetAddress"
                    value={formData.address?.streetAddress || ''}
                    placeholder="Street Address"
                    onChange={handleChange}
                    className="bg-background border-b border-green shadow-md outline-none"
                  />
                  <Input
                    name="address.apartmentNumber"
                    value={formData.address?.apartmentNumber || ''}
                    placeholder="Apartment Number"
                    onChange={handleChange}
                    className="bg-background border-b border-green shadow-md outline-none"
                  />
                  <Input
                    name="address.city"
                    value={formData.address?.city || ''}
                    placeholder="City"
                    onChange={handleChange}
                    className="bg-background border-b border-green shadow-md outline-none"
                  />
                  <Input
                    name="address.state"
                    value={formData.address?.state || ''}
                    placeholder="State"
                    onChange={handleChange}
                    className="bg-background border-b border-green shadow-md outline-none"
                  />
                  <Input
                    name="address.zipCode"
                    value={formData.address?.zipCode || ''}
                    placeholder="Zip Code"
                    onChange={handleChange}
                    className="bg-background border-b border-green shadow-md outline-none"
                  />
                </div>
              ) : (
                <>
                  {formData.address &&
                    formatAddress(formData.address).split('\n').map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))
                  }
                </>
              )}
            </div>
            <div className="font-medium text-green">
              {profileType === AccountType.CLIMBER ? 'User Since:' : 'Gym Since:'}
            </div>
            <div className="text-green">{new Date(formData?.createdAt ?? "").toLocaleDateString()}</div>
          </>
        )}

        {/* --- Series specific fields --- 
        {profileType === AccountType.SERIES && formData && 'startDate' in formData && (
          <>
            {/* Description 
            {renderInput("Description:", "description", formData.description)}

            {/* Start Date 
            <div className="font-medium text-green">Start Date:</div>
            <div className="text-green">
              {editing ? (
                <div className="bg-background">
                  <SegmentedDateInput
                    mode="generic"
                    value={normalizeBackendDateOrDateTime(formData.startDate)}
                    onChange={makeDateChangeHandler<SeriesData>("endDate", setFormData, "datetime")}
                  />
                </div>
              ) : (
                new Date(formData.startDate + "T00:00:00").toLocaleDateString()
              )}
            </div>

            {/* End Date 
            <div className="font-medium text-green">End Date:</div>
            <div className="text-green">
              {editing ? (
                <div className="bg-background">
                  <SegmentedDateInput
                    mode="generic"
                    value={normalizeBackendDateOrDateTime(formData.endDate)}
                    onChange={makeDateChangeHandler<SeriesData>("startDate", setFormData, "datetime")}
                  />
                </div>
              ) : (
                new Date(formData.endDate + "T00:00:00").toLocaleDateString()
              )}
            </div>

            {/* Registration Deadline 
            <div className="font-medium text-green">Registration Deadline:</div>
            <div className="text-green">
              {editing ? (
                <div className="bg-background">
                  <SegmentedDateInput
                    mode="generic"
                    value={normalizeBackendDateOrDateTime(formData.deadline)}
                    onChange={makeDateChangeHandler<SeriesData>("deadline", setFormData, "datetime")}
                  />
                </div>
              ) : (
                new Date(formData.deadline + "T00:00:00").toLocaleDateString()
              )}
            </div>

            {/* Created At 
            <div className="font-medium text-green">Series Created:</div>
            <div className="text-green">
              {new Date(formData.createdAt).toLocaleDateString()}
            </div>
          </>
        )}

      </div>

      <div className="mt-3 space-x-4">
        {editing ? (
          <>
            <button onClick={handleSubmit} className="bg-green text-background px-4 py-1 rounded-md font-semibold">Save</button>
            <button onClick={() => { setEditing(false); setFormData(formData); }} className="bg-accent text-background px-4 py-1 rounded-md font-semibold">Cancel</button>
          </>
        ) : (
          <Button
            onClick={() => setEditing(true)} 
          >
            <UserPen size={18} />
            <span className="relative top-[1px]">Edit Profile</span>
          </Button>
        )}
      </div>
    </div>
  )
}
*/