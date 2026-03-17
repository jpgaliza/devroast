"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";

export interface ShareRoastButtonProps extends Omit<ButtonProps, "onClick"> {
  relativeUrl: string;
}

export const ShareRoastButton = React.forwardRef<
  HTMLButtonElement,
  ShareRoastButtonProps
>(({ relativeUrl, children, ...props }, ref) => {
  const router = useRouter();

  const handleClick = React.useCallback(() => {
    router.push(relativeUrl);
  }, [relativeUrl, router]);

  return (
    <Button ref={ref} onClick={handleClick} {...props}>
      {children}
    </Button>
  );
});

ShareRoastButton.displayName = "ShareRoastButton";
