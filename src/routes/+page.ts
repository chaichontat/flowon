import { error } from '@sveltejs/kit';

export async function load({ url, fetch }) {
	const getURL = url.searchParams.get('url');

	if (!getURL || !getURL.endsWith('.fcs')) {
		error(401, 'Invalid URL. URL must ends with .fcs.');
	}

	return { arrayBuf: fetch(getURL).then((x) => x.arrayBuffer()) };
}
