# Prikkert

Prikkert is the open-source app for scheduling group events. It makes four core promises:

- **Always free**: no paid features or hidden costs
- **No ads**: no sponsored content or pop-ups
- **No tracking**: no analytics, no data selling, no accounts
- **Open source**: anyone can read, modify, and self-host the code

Built with [SvelteKit](https://svelte.dev) (frontend framework), [Tailwind CSS](https://tailwindcss.com) (styling), [Drizzle ORM](https://orm.drizzle.team) (ORM), and [Wuchale](https://wuchale.dev) (i18n).

## Contributing

Contributions are very welcome! Check the [issue tracker](https://codeberg.org/qcoret/prikkert/issues) for open tasks or open a new issue to discuss your idea.

## Development

You'll need Node 24+, pnpm 10+, and Docker.

```bash
cp .env.example .env
# set values in .env
pnpm install
docker compose -f compose.yml up -d
pnpm drizzle-kit push
pnpm dev
```

The SvelteKit development server runs on `localhost:5173` by default. It also runs the Wuchale watcher, which automatically extracts translation strings from the code. Please update translations in `src/locales` and run `pnpm wuchale --clean` before committing.

Other useful commands: `pnpm build`, `pnpm check`, `pnpm lint`, `pnpm lint:fix`.

## Production

Production runs as two Docker containers (Node server + Postgres). The included `compose.prod.yml` uses Traefik as a reverse proxy. Adjust the labels and `.env` to match your setup, or swap Traefik for your own reverse proxy.

```bash
cp .env.example .env
# set values in .env
docker compose -f compose.prod.yml up -d --build
```

You can also use [docker-rollout](https://github.com/Wowu/docker-rollout) for zero-downtime deployments.

```bash
docker compose -f compose.prod.yml build app
docker rollout -f compose.prod.yml app
```

When self-hosting, please set `PUBLIC_NO_INDEX=1` or use your own branding, to avoid confusing search engines. Note that the [EUPL license](LICENSE) has a network use clause: if you run a modified version as a public service, please release your source code.

Set `PUBLIC_ORIGIN` in `.env` to your domain (e.g. `https://example.com`). See `.env.example` for all options.

## License

[EUPL-1.2](LICENSE)
