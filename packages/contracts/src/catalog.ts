import { z } from "zod";

export const zevlinCatalogMediaSchema = z.object({
  imagePath: z.string().min(1),
  imageAlt: z.string().min(1),
  label: z.string().min(1),
});

export const zevlinCatalogProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().min(1),
  priceCents: z.number().int().nonnegative(),
  slug: z.string().min(1),
  media: zevlinCatalogMediaSchema,
});

export type ZevlinCatalogMedia = z.infer<typeof zevlinCatalogMediaSchema>;
export type ZevlinCatalogProduct = z.infer<typeof zevlinCatalogProductSchema>;
