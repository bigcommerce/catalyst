"use client";

import type { Statsig } from "@flags-sdk/statsig";
import { StatsigProvider, useClientBootstrapInit } from "@statsig/react-bindings";
import { StatsigAutoCapturePlugin } from "@statsig/web-analytics";
import type { ReactNode } from "react";

export function DynamicStatsigProvider({ children, datafile, }: {
  children: ReactNode;
  datafile: Awaited<ReturnType<typeof Statsig.getClientInitializeResponse>>;
}) {
  if (!datafile) throw new Error("Missing datafile");

  const client = useClientBootstrapInit(
    process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY as string,
    datafile.user,
    JSON.stringify(datafile),
    { plugins: [new StatsigAutoCapturePlugin()] } // Optional, will add autocaptured web analytics events to Statsig
  );

  return (
    <StatsigProvider user={datafile.user} client={client}>
      {children}
    </StatsigProvider>
  );
}
