import { useEffect, useState } from 'react';

export function EventTimeline() {
  const [events] = useState([
    { id: 1, time: '2026-03-12T04:10:00Z', msg: 'System initialized on Stacks Testnet', status: 'info' },
    { id: 2, time: '2026-03-12T04:25:00Z', msg: 'Protocol contracts deployed successfully', status: 'success' },
    { id: 3, time: '2026-03-12T04:30:00Z', msg: 'Awaiting first institution deposit...', status: 'pending' },
  ]);

  useEffect(() => {
    // Polling logic would go here
  }, []);

  return (
    <div className="space-y-4">
      {events.slice().reverse().map(event => (
        <div key={event.id} className="flex gap-4 p-3 border-2 border-black bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <div className="mono text-[10px] font-bold w-24 shrink-0">
            {new Date(event.time).toLocaleTimeString()}
          </div>
          <div className="flex-1 text-xs font-bold leading-tight uppercase">
            {event.msg}
          </div>
          <div className={`w-2 h-2 rounded-full mt-1 ${
            event.status === 'success' ? 'bg-green-500' :
            event.status === 'info' ? 'bg-blue-500' : 'bg-orange-500'
          }`} />
        </div>
      ))}
    </div>
  );
}
