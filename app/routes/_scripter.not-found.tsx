import { BugIcon } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2">
      <BugIcon className="size-10 text-muted-foreground" />
      <div>Function Not Found</div>
    </div>
  )
}
