import { error } from '@sveltejs/kit';
import { getPost, getPosts } from '#lib/server/content.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => getPosts().map(({ slug }) => ({ slug }));

export const load: PageServerLoad = ({ params }) => {
	const post = getPost(params.slug);
	if (!post) error(404, 'Článok neexistuje');
	return {
		post,
		morePosts: getPosts()
			.filter(({ slug }) => slug !== post.slug)
			.slice(0, 2)
	};
};
