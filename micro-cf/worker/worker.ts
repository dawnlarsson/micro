export default {
	async fetch(request, env, ctx) {

		const url = new URL(request.url);

		if (!url.pathname.startsWith('/api/')) {
			return new Response('Not Found', { status: 404 });
		}

		switch (url.pathname) {
			case '/api/random':
				return new Response(crypto.randomUUID());
		}
	},
}
