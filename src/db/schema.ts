import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ─── Universities ───────────────────────────────────────────
export const universities = sqliteTable("universities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  province: text("province").notNull(),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  apsSystemType: text("aps_system_type").notNull().default("standard"), // 'standard' | 'cap4' | 'halve' | 'include'
  admissionNote: text("admission_note"),
});

// ─── Subjects (NSC) ─────────────────────────────────────────
export const subjects = sqliteTable("subjects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(), // 'language' | 'mathematics' | 'sciences' | 'commerce' | 'humanities' | 'technology' | 'arts' | 'core'
  isCore: integer("is_core", { mode: "boolean" }).notNull().default(false),
});

// ─── Programs ───────────────────────────────────────────────
export const programs = sqliteTable("programs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  universityId: integer("university_id")
    .notNull()
    .references(() => universities.id),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  faculty: text("faculty").notNull(),
  qualificationType: text("qualification_type").notNull().default("degree"), // 'degree' | 'diploma' | 'extended_degree'
  durationYears: integer("duration_years").notNull().default(3),
  description: text("description"),
  pathwayProgramSlug: text("pathway_program_slug"),
  pathwayLabel: text("pathway_label"),
});

// ─── Program APS Rules ──────────────────────────────────────
export const programApsRules = sqliteTable("program_aps_rules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  programId: integer("program_id")
    .notNull()
    .references(() => programs.id)
    .unique(),
  minApsScore: integer("min_aps_score").notNull(),
});

// ─── Program Subject Rules ──────────────────────────────────
export const programSubjectRules = sqliteTable("program_subject_rules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  programId: integer("program_id")
    .notNull()
    .references(() => programs.id),
  subjectId: integer("subject_id")
    .notNull()
    .references(() => subjects.id),
  minLevel: integer("min_level").notNull(), // 1-7 achievement level
  groupId: integer("group_id"), // NULL = mandatory AND; same group_id = OR alternatives
});

// ─── Relations ──────────────────────────────────────────────
export const universitiesRelations = relations(universities, ({ many }) => ({
  programs: many(programs),
}));

export const programsRelations = relations(programs, ({ one, many }) => ({
  university: one(universities, {
    fields: [programs.universityId],
    references: [universities.id],
  }),
  apsRule: one(programApsRules, {
    fields: [programs.id],
    references: [programApsRules.programId],
  }),
  subjectRules: many(programSubjectRules),
}));

export const programApsRulesRelations = relations(
  programApsRules,
  ({ one }) => ({
    program: one(programs, {
      fields: [programApsRules.programId],
      references: [programs.id],
    }),
  })
);

export const programSubjectRulesRelations = relations(
  programSubjectRules,
  ({ one }) => ({
    program: one(programs, {
      fields: [programSubjectRules.programId],
      references: [programs.id],
    }),
    subject: one(subjects, {
      fields: [programSubjectRules.subjectId],
      references: [subjects.id],
    }),
  })
);
