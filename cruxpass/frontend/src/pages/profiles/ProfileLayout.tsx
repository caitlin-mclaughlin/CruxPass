// @/pages/profiles/ProfileLayout
import { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { UserPen } from "lucide-react";

type ProfileLayoutProps = {
  title?: string;
  name?: string;
  editing: boolean;
  setEditing: (val: boolean) => void;
  handleSubmit: () => void;
  loading: boolean;
  children: ReactNode;
};

export default function ProfileLayout({
  title,
  name,
  editing,
  setEditing,
  handleSubmit,
  loading,
  children,
}: ProfileLayoutProps) {
  if (loading) {
    return <div className="h-screen p-8 bg-background text-green">Loading...</div>;
  }

  return (
    <div>
      {name && (
        <h2 className="text-xl font-semibold mb-2">{name}</h2>
      )}

      <div className="grid grid-cols-4 gap-y-3 rounded-md shadow-md px-3 py-2 bg-shadow border border-green">
        {children}
      </div>

      <div className="mt-3 space-x-4">
        {editing ? (
          <>
            <button
              onClick={handleSubmit}
              className="bg-green text-background px-4 py-1 rounded-md font-semibold"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="bg-accent text-background px-4 py-1 rounded-md font-semibold"
            >
              Cancel
            </button>
          </>
        ) : (
          <Button onClick={() => setEditing(true)}>
            <UserPen size={18} />
            <span className="relative top-[1px]">Edit Profile</span>
          </Button>
        )}
      </div>
    </div>
  );
}
