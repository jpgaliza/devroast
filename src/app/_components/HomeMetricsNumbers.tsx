"use client";

import * as React from "react";
import NumberFlow from "@number-flow/react";

interface HomeMetricsNumbersProps {
  roastedCodes: number;
  avgScore: number;
}

export function HomeMetricsNumbers({
  roastedCodes,
  avgScore,
}: HomeMetricsNumbersProps) {
  const [shouldAnimate, setShouldAnimate] = React.useState(false);

  React.useEffect(() => {
    setShouldAnimate(true);
  }, []);

  return (
    <div className="flex items-center justify-center gap-6 text-text-tertiary font-ibm text-xs">
      <span>
        <NumberFlow
          value={shouldAnimate ? roastedCodes : 0}
          locales="en-US"
          format={{ maximumFractionDigits: 0 }}
        />{" "}
        codes roasted
      </span>
      <span className="font-jb">·</span>
      <span>
        avg score:{" "}
        <NumberFlow
          value={shouldAnimate ? avgScore : 0}
          locales="en-US"
          format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
        />
        /10
      </span>
    </div>
  );
}
