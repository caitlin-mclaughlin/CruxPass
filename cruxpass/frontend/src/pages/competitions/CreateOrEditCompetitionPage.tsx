import { useGymSession } from "@/context/GymSessionContext";
import { Navigate } from "react-router-dom";
import { CreateOrEditCompetitionEditor } from "./CreateOrEditCompetitionEditor";
import { LoadingPage } from "@/components/ui/loading/LoadingPage";

export default function CreateOrEditCompetitionPage() {
  const {
    gym,
    gymSessionLoading,
  } = useGymSession();

  // Loading state
  if (gymSessionLoading) {
    return (
      <LoadingPage/>
    );
  }

  // Not authenticated
  if (!gym) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated
  return <CreateOrEditCompetitionEditor gym={gym} />;
}
