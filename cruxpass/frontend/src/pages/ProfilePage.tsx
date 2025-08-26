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
import { getClimberProfile } from "@/services/climberService";
import { getGymProfile } from "@/services/gymService";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
  const { token } = useAuth();
  const { climber, updateClimberProfile } = useClimberSession();
  const { gym, updateGymProfile } = useGymSession();

  const hasInitialized = useRef(false);
  const [profileType, setProfileType] = useState<AccountType | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const minDob = new Date(today.getFullYear() - MAX_AGE, today.getMonth(), today.getDate());
  const maxDob = new Date(today.getFullYear() - MIN_AGE, today.getMonth(), today.getDate());

  // Fetch profile using context + services
  useEffect(() => {
    if (!token || hasInitialized.current) return;
    hasInitialized.current = true;

    async function loadProfile() {
      try {
        if (climber) {
          setProfileType(AccountType.CLIMBER);
          setFormData({ ...climber });
        } else if (gym) {
          setProfileType(AccountType.GYM);
          setFormData({ ...gym });
        } else {
          // Fallback in case context hasn't populated yet
          const climberRes = await getClimberProfile().catch(() => null);
          if (climberRes) {
            setProfileType(AccountType.CLIMBER);
            setFormData(climberRes.data);
            return;
          }
          const gymRes = await getGymProfile().catch(() => null);
          if (gymRes) {
            setProfileType(AccountType.GYM);
            setFormData(gymRes);
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [token, climber, gym]);

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

  const handleDobChange = (date: Date | null) => {
    setFormData((prev: any) => ({
      ...prev,
      dob: date,
    }));
  };

  const handleSubmit = async () => {
    if (profileType === AccountType.CLIMBER) {
      const dobDate = new Date(formData.dob);
      const age = today.getFullYear() - dobDate.getFullYear();
      if (age < MIN_AGE || age > MAX_AGE) {
        alert(`Date of birth must be between ages ${MIN_AGE} and ${MAX_AGE}`);
        return;
      }
    }

    try {
      if (profileType === AccountType.CLIMBER) {
        await updateClimberProfile(formData);
      } else {
        await updateGymProfile(formData);
      }
      setEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Profile update failed.");
    }
  };

  if (loading) return <div className="h-screen p-8 bg-background text-green">Loading...</div>;
  if (!formData) return <div className="h-screen p-8 bg-background text-green">No profile found.</div>;

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
      <h1 className="text-xl font-semibold mb-4">
        {profileType === AccountType.CLIMBER ? 'Climber Profile' : 'Gym Profile'}
      </h1>

      <div className="grid grid-cols-2 gap-y-3 max-w-md rounded-md px-2 py-2 bg-shadow border border-green">
        {renderInput(profileType === AccountType.CLIMBER ? 'Name:' : 'Gym Name:', 'name', formData.name)}
        {renderInput('Email:', 'email', formData.email)}
        {renderInput('Phone:', 'phone', formatPhoneNumber(formData.phone))}
        {renderInput('Username:', 'username', formData.username)}

        {profileType === AccountType.CLIMBER && (
          <>
            <div className="font-medium text-green">Date of Birth:</div>
            <div className="text-green">
              {editing ? (
                <div className="w-full bg-background border rounded-md shadow-md">
                  <SegmentedDateInput
                    onChange={handleDobChange}
                    value={new Date(formData.dob + "T00:00:00")}
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

        {/* Address Field */}
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
            formatAddress(formData.address).split('\n').map((line, idx) => (
              <div key={idx}>{line}</div>
            ))
          )}
        </div>

        <div className="font-medium text-green">
          {profileType === AccountType.CLIMBER ? 'User Since:' : 'Gym Since:'}
        </div>
        <div className="text-green">{new Date(formData.createdAt).toLocaleDateString()}</div>
      </div>

      <div className="mt-6 space-x-4">
        {editing ? (
          <>
            <button onClick={handleSubmit} className="bg-green text-background px-4 py-1 rounded-md font-semibold">Save</button>
            <button onClick={() => { setEditing(false); setFormData(formData); }} className="bg-accent text-background px-4 py-1 rounded-md font-semibold">Cancel</button>
          </>
        ) : (
          <button 
            onClick={() => setEditing(true)} 
            className="flex items-center bg-green text-background px-4 py-1.5 rounded-md font-semibold hover:bg-select"
          >
            <UserPen size={18} className="mr-2" />
            <span className="relative top-[1px]">Edit Profile</span>
          </button>
        )}
      </div>
    </div>
  )
}
