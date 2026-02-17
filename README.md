# Prikkert

Prikkert is the open-source app for scheduling groep events. Always free, no ads.

## Development

You'll need Node 24+, pnpm 10+, and Docker.

```bash
pnpm install
docker compose up -d
pnpm drizzle-kit push
pnpm dev
```

Other useful commands: `pnpm build`, `pnpm check`, `pnpm lint`, `pnpm lint:fix`.

## Deployment

Production runs as a Docker container behind an external Traefik instance:

```bash
docker compose -f compose.prod.yml up -d --build
```

This spins up the app, Postgres, and a Drizzle Gateway. You'll need to tweak the Traefik labels and `.env` to match your setup.

## License

[EUPL-1.2](LICENSE)
