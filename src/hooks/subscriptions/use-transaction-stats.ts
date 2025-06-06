"use client";

import useSWR from "swr";
import useSWRSubscription from "swr/subscription";
import { supabase } from "@/lib/supabase/client";
import { getLoanStats } from "@/app/data";

export const key = "realtime_overview_cards";

export const useLoanStats = () => {
  const swr = useSWR(key, getLoanStats, { revalidateOnFocus: false });

  useSWRSubscription(key, (key, { next }) => {
    const channel = supabase
      .channel("realtime-overview-cards")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "loans",
        },
        (payload) => {
          swr.mutate();
          next(null, payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  });

  return swr;
};
