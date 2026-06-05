import { z } from "zod";

// ─── API Validation Schemas ─────────────────────────────────

export const subjectMarkSchema = z.object({
  subjectId: z.number().int().positive(),
  mark: z.number().min(0).max(100),
});

export const matchRequestSchema = z.object({
  subjects: z
    .array(subjectMarkSchema)
    .min(6, "At least 6 subjects required")
    .max(10, "Maximum 10 subjects allowed"),
});

export type MatchRequest = z.infer<typeof matchRequestSchema>;

// ─── Lead Capture Schema (Phase 2 ready) ────────────────────

export const leadCaptureSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  programId: z.number().int().positive(),
  studentAps: z.number().int(),
  subjects: z.array(subjectMarkSchema),
});

export type LeadCapture = z.infer<typeof leadCaptureSchema>;
