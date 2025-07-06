import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

// Define categories inline to avoid import issues
const CATEGORIES = {
	'data-analytics-bi': 'Data Analytics & Business Intelligence',
	'data-engineering-infra': 'Data Engineering & Infrastructure',
	'data-science-ml': 'Data Science & Machine Learning',
	'generative-ai-llm': 'Generative AI & Large Language Models',
	'automation-workflow': 'Automation & Workflow Optimization',
	'life-career-skills': 'Life, Career & Other Skills'
} as const;

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) => z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: image().optional(),
		author: z.string(),
		category: z.enum(Object.keys(CATEGORIES) as [keyof typeof CATEGORIES, ...Array<keyof typeof CATEGORIES>]),
		tags: z.array(z.string()).min(1).max(10),
		hasQuiz: z.boolean().default(false),
		quizTitle: z.string().optional(),
		quizDescription: z.string().optional(),
		quizDifficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
		quizTimeLimit: z.number().optional(),
		readingTime: z.number().optional(),
		featured: z.boolean().default(false),
		tableOfContents: z.boolean().default(true),
	}),
});

const authors = defineCollection({
	schema: ({ image }) => z.object({
		name: z.string(),
		bio: z.string(),
		avatar: image().optional(),
		social: z.object({
			twitter: z.string().optional(),
			linkedin: z.string().optional(),
			github: z.string().optional(),
		}).optional(),
	}),
});

export const collections = { blog, authors };
