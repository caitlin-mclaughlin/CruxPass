import { CircularProgress } from "@mui/material"
import PageContainer from "../../PageContainer"

interface LoadingSnippetProps {
  className?:string,
  text?: string
}
export function LoadingSnippet({
  className="flex items-center justify-center",
  text="Loading..."
}: LoadingSnippetProps) {
  return (
    <div className={className}>
        <p>{text}</p>
        <CircularProgress color="success"/>
    </div>
  )
}