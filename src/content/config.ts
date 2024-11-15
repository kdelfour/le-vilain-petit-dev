import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		cover: z.string().optional(),
		category: z.string().optional(),
		tags: z.array(z.string()).optional(),
	}),
});

const books = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		author: z.string(),
		pubDate: z.number(),
		publisher: z.string(),
		link: z.string().url().nullable().optional(),
		cover: z.string(),
		isbn: z.string().nullable().optional(),
	}),
});

export const collections = { articles, books };
