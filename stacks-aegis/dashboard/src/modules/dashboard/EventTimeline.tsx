import React, { useEffect, useState, useRef } from 'react';
import { CONTRACT_ADDRESSES, stacksApiClient } from '../../lib/stacks-client';

interface ContractEvent {
  tx_id: string;
  block_height: number;
  event_type: string;
  contract_log?: {
    value: { repr: string };
  };
}

interface ParsedEvent {
  id: string;
  message: string;
  type: "trigger" | "action" | "success" | "neutral";
  block: number;
}

export function EventTimeline() {
  const [events, setEvents] = useState<ParsedEvent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const [contractAddress, contractName] = CONTRACT_ADDRESSES.aegisVault.split('.');
        // Check API documentation structure equivalent mapping for Node API SDK standard limits
        const res = await stacksApiClient.smartContractsApi.getContractEventsById({
          contractAddress,
          contractName,
          limit: 30, // Get recent to find 10 valid ones
        });

        const logs = ((res as any).results || []).filter((e: ContractEvent) => e.event_type === 'smart_contract_log' && e.contract_log);
        
        const parsedLogs = logs.map((log: ContractEvent, i: number) => {
          const repr = log.contract_log!.value.repr || "";
          let type: "trigger" | "action" | "success" | "neutral" = "neutral";
          let message = repr.replace(/"/g, '');

          if (repr.includes("CIRCUIT-BREAKER-TRIPPED")) {
            type = "trigger";
            message = "CIRCUIT BREAKER TRIPPED: All assets moved to safe vault.";
          } else if (repr.includes("CIRCUIT-BREAKER-RESET")) {
            type = "success";
            message = "CIRCUIT BREAKER RESET: Normal operations resumed.";
          } else if (repr.includes("EMERGENCY-EXIT-TRIGGERED")) {
            type = "action";
            message = "Emergency Vault Evacuation Executed.";
          }

          return {
            id: `${log.tx_id}-${i}`,
            message,
            type,
            block: log.block_height
          };
        }).slice(0, 10).reverse(); // Oldest first for scrolling to bottom chronologically

        setEvents(parsedLogs);
      } catch (err) {
        console.error("Failed to fetch timeline events", err);
      }
    };

    fetchEvents();
    const intId = setInterval(fetchEvents, 10000);
    return () => clearInterval(intId);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  if (events.length === 0) {
    return (
       <div className="h-[200px] flex items-center justify-center text-muted-foreground italic font-bold">
        Listening for blockchain events...
      </div>
    );
  }

  return (
    <div className="h-[200px] overflow-y-auto space-y-4 pr-2 custom-scrollbar" ref={scrollRef}>
      {events.map((e) => (
        <div key={e.id} className="flex gap-4 items-start pb-4 border-b-2 border-black/5 last:border-0">
          <div className="w-16 flex-shrink-0 mono text-[10px] text-muted-foreground text-right pt-0.5">
            BLK {e.block}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-bold ${
              e.type === "trigger" ? "text-red-500" :
              e.type === "success" ? "text-green-500" :
              e.type === "action" ? "text-blue-500" : "text-black"
            }`}>
              {e.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
