# watermarks-remover frontend

Next.js + TypeScript frontend for the `watermarks-remover` backend service.

## Development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Environment

Copy `.env.example` to `.env` and adjust values:

- `WATERMARKS_SERVICE_URL`: backend HTTP service URL (default `http://127.0.0.1:8765`)
- `WATERMARKS_SERVICE_API_KEY`: optional backend bearer token
- `NEXT_PUBLIC_CREDITS_*`: initial balance and pricing defaults

## Scripts

- `npm run dev` – development server
- `npm run build` – production build
- `npm run start` – run production server
- `npm run lint` – lint code
- `npm run generate:api` – regenerate OpenAPI types from `openapi.json`
