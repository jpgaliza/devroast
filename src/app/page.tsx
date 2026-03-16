import { Suspense } from "react";
import { HomeInteractive } from "@/app/_components/HomeInteractive";
import { HomeMetrics } from "@/app/_components/HomeMetrics";
import { HomeMetricsSkeleton } from "@/app/_components/HomeMetricsSkeleton";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center pt-20 px-10">
        <HomeInteractive>
          <Suspense fallback={<HomeMetricsSkeleton />}>
            <HomeMetrics />
          </Suspense>
        </HomeInteractive>
      </div>
    </main>
  );
}
