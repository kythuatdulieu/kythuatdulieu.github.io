import { defineCollection, z } from 'astro:content';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		schema: docsSchema({
			extend: z.object({
				category: z.string().optional(),
				difficulty: z.string().optional(),
				tags: z.array(z.string()).optional(),
				readingTime: z.string().optional(),
				seoTitle: z.string().optional(),
				metaDescription: z.string().optional(),
				// Phân loại mới (taxonomy.js) + metadata rewrite v2
				domains: z.array(z.string()).optional(),
				level: z.string().optional(),
				definition: z.string().optional(),
				aliases: z.array(z.string()).optional(),
				lastUpdated: z.union([z.string(), z.date()]).optional(),
				refs: z.array(z.any()).optional(),
			}),
		}),
	}),
	i18n: defineCollection({ type: 'data', schema: i18nSchema() }),
};
