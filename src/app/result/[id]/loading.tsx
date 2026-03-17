function LoadingBar({ widthClass }: { widthClass: string }) {
  return (
    <div className="h-3 w-full border border-border-primary bg-bg-surface p-0.5">
      <div
        className={["h-full animate-pulse bg-accent-green/70", widthClass].join(
          " ",
        )}
      />
    </div>
  );
}

function LoadingPanel() {
  return (
    <div className="border border-border-primary bg-bg-surface/60 p-4 md:p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="font-jb text-sm font-bold text-accent-green">//</span>
        <div className="h-3 w-40 animate-pulse bg-border-primary" />
      </div>
      <div className="space-y-3">
        <div className="h-3 w-full animate-pulse bg-border-primary" />
        <div className="h-3 w-5/6 animate-pulse bg-border-primary" />
        <div className="h-3 w-2/3 animate-pulse bg-border-primary" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="mx-auto flex w-full max-w-360 flex-1 flex-col gap-10 px-5 py-10 md:px-10 md:py-10 lg:px-20">
        <section className="flex flex-col gap-8 md:flex-row md:items-center md:gap-12">
          <div className="flex h-45 w-45 shrink-0 items-center justify-center rounded-full border border-border-primary bg-bg-surface">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="font-jb text-xs uppercase tracking-[0.28em] text-accent-green">
                analyzing
              </span>
              <span className="font-jb text-3xl text-text-primary">...</span>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="h-7 w-36 animate-pulse bg-border-primary" />
            <div className="space-y-3">
              <div className="h-6 w-full max-w-160 animate-pulse bg-border-primary" />
              <div className="h-6 w-5/6 max-w-120 animate-pulse bg-border-primary" />
            </div>
            <div className="h-3 w-44 animate-pulse bg-border-primary" />
            <div className="max-w-120">
              <p className="mb-3 font-jb text-xs text-text-tertiary">
                // opening roast result...
              </p>
              <LoadingBar widthClass="w-2/3" />
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-border-primary" />

        <section className="flex flex-col gap-4">
          <LoadingPanel />
        </section>

        <div className="h-px w-full bg-border-primary" />

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <LoadingPanel />
          <LoadingPanel />
          <LoadingPanel />
          <LoadingPanel />
        </section>
      </div>
    </main>
  );
}
