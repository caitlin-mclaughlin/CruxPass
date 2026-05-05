import { CircularProgress } from "@mui/material"
import PageContainer from "../../PageContainer"

interface LoadingPageProps {
  text?: string
}
export function LoadingPage({
  text="Loading..."
}: LoadingPageProps) {
  return (
    <PageContainer>
      <div className="h-full w-full flex flex-col items-center justify-center">
        <p>{text}</p>
        <CircularProgress color="success"/>
      </div>
    </PageContainer>
  )
}