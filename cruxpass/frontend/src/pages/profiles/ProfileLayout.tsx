// @/pages/profiles/ProfileLayout
import { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Ban, Save, UserPen } from "lucide-react";
import { LoadingPage } from "@/components/ui/loading/LoadingPage";

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
    return <LoadingPage />;
  }

  // Children can be a single element or an array
  const [main, extra] = Array.isArray(children) ? children : [children];

  return (
    <div>
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] gap-3 
                      rounded-md shadow-md px-3 py-2 bg-shadow border border-green truncate">
        {main}
      </div>
      
      {extra && <div className="mt-3">{extra}</div>}

      <div className="mt-3 space-x-4">
        {editing ? (
          <>
            <Button onClick={handleSubmit}>
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
