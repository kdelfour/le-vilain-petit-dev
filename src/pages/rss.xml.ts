import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context: any) {
	const allPosts = await getCollection("articles");
	const today = new Date();
	const posts = allPosts.filter(post => new Date(post.data.pubDate) <= today);
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			...post.data,
			link: import.meta.env.BASE_URL + `/articles/${post.slug}/`,
		})),
	});
}
