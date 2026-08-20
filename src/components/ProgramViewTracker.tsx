"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

interface ProgramViewTrackerProps {
  universitySlug: string;
  programSlug: string;
}

export default function ProgramViewTracker({ universitySlug, programSlug }: ProgramViewTrackerProps) {
  useEffect(() => {
    trackEvent("program_viewed", {
      university: universitySlug,
      program: programSlug,
    });
  }, [universitySlug, programSlug]);

  return null;
}
