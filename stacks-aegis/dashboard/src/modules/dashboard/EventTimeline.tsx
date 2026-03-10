import React from "react"
import { AlertCircle, CheckCircle2, ShieldCheck, Zap } from "lucide-react"

interface Event {
  id: string
  time: string
  message: string
  type: "trigger" | "action" | "success"
}

interface EventTimelineProps {
  events: Event[]
}

export function EventTimeline({ events }: EventTimelineProps) {
  return (
    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-black/20">
      {events.map((event) => (
        <div key={event.id} className="relative flex items-start pl-10">
          <div className={`absolute left-0 flex h-10 w-10 items-center justify-center border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
            {event.type === "trigger" && <AlertCircle className="h-5 w-5 text-panic" />}
            {event.type === "action" && <Zap className="h-5 w-5 text-warning" />}
            {event.type === "success" && <ShieldCheck className="h-5 w-5 text-safe" />}
          </div>
          <div className="flex flex-col">
            <span className="mono text-[10px] font-bold text-muted-foreground">{event.time}</span>
            <span className="text-sm font-bold uppercase">{event.message}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
