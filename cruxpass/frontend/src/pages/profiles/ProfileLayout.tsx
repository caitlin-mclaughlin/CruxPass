// @/pages/profiles/ProfileLayout
import { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Ban, Save, UserPen } from "lucide-react";

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
      <div className="grid grid-cols-4 gap-y-3 rounded-md shadow-md px-3 py-2 bg-shadow border border-green">
        {children}
      </div>

      <div className="mt-3 space-x-4">
        {editing ? (
          <>
            <Button
              onClick={handleSubmit}
            >
              <Save size={18} />
              <span className="relative top-[1px]">Save</span>
            </Button>
            <Button
              onClick={() => setEditing(false)}
              className="bg-accent hover:bg-accentHighlight"
            >
              <Ban size={18} />
              <span className="relative top-[1px]">Cancel</span>
            </Button>
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
