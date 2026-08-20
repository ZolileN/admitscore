import type { MetadataRoute } from "next";
import { db } from "@/db";
import { programs, universities } from "@/db/schema";
import { SITE_URL } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/calculate`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/requirements`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/timeline`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/simulate`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/counsellor`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/compare`, changeFrequency: "monthly", priority: 0.5 },
  ];

  try {
    const allUnis = await db.select().from(universities);
    const allPrograms = await db.select().from(programs);
    const uniSlugById = new Map(allUnis.map((u) => [u.id, u.slug]));

    const dynamicRoutes: MetadataRoute.Sitemap = [];
    for (const uni of allUnis) {
      dynamicRoutes.push({
        url: `${SITE_URL}/requirements/${uni.slug}`,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    for (const program of allPrograms) {
      const uniSlug = uniSlugById.get(program.universityId);
      if (!uniSlug) continue;
      dynamicRoutes.push({
        url: `${SITE_URL}/requirements/${uniSlug}/${program.slug}`,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    return [...staticRoutes, ...dynamicRoutes];
  } catch {
    return staticRoutes;
  }
}
