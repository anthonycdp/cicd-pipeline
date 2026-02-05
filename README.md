# CI/CD Pipeline Demo

Node.js/TypeScript REST API used to demonstrate build, test, security, Docker, and CI workflow structure.

## Features

- Express API with TypeScript
- In-memory users resource with normalized input validation
- Health endpoints for readiness and liveness checks
- Jest and Supertest test suite
- ESLint, TypeScript type checking, and `npm audit`
- Multi-stage Docker build for development and production
- GitHub Actions workflow for build, test, security scanning, image build, and deploy templates

## Project Structure

```text
cicd-pipeline/
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── src/
│   ├── app.ts
│   ├── index.ts
│   ├── config/
│   │   └── appVersion.ts
│   ├── middleware/
│   │   └── errorHandler.ts
│   ├── routes/
│   │   ├── health.ts
│   │   └── users.ts
│   ├── users/
│   │   ├── userMapper.ts
│   │   └── userService.ts
│   └── types/
│       └── index.ts
├── tests/
│   ├── app.test.ts
│   ├── health.test.ts
│   └── users.test.ts
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 20+
- Docker Desktop or Docker Engine with Compose v2

### Local Development

```bash
# Install dependencies from lockfile
npm ci

# Run the API with hot reload
npm run dev

# Run quality checks
npm run typecheck
npm run lint
npm test
npm run build
npm audit --audit-level=moderate
```

The API runs on `http://localhost:3000` by default.

### Docker

```bash
# Development container
docker compose up app

# Test container
docker compose --profile test up --build --abort-on-container-exit --exit-code-from test test

# Production-like container
docker compose --profile production up --build app-prod
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API summary and version |
| GET | `/health` | Full health payload |
| GET | `/health/ready` | Readiness check |
| GET | `/health/live` | Liveness check |
| GET | `/api/users` | List users |
| GET | `/api/users/:id` | Get a single user |
| POST | `/api/users` | Create a user |
| PUT | `/api/users/:id` | Update a user |
| DELETE | `/api/users/:id` | Delete a user |

### Example Requests

```bash
# Root endpoint
curl http://localhost:3000/

# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com"}'

# List users
curl http://localhost:3000/api/users
```

User timestamps are returned as ISO strings.

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Runtime environment |
| `PORT` | `3000` | HTTP port |
| `APP_VERSION` | package version | Version exposed by `/` and `/health` |

## Testing

```bash
# Full test run
npm test

# Watch mode
npm run test:watch

# Coverage report
npm test -- --coverage
```

Coverage thresholds from `jest.config.js`:

- Branches: 50%
- Functions: 80%
- Lines: 80%
- Statements: 80%

Coverage report location: `coverage/lcov-report/index.html`

Examples for opening the report:

- Windows PowerShell: `start coverage\\lcov-report\\index.html`
- macOS: `open coverage/lcov-report/index.html`
- Linux: `xdg-open coverage/lcov-report/index.html`

## Docker Notes

The Dockerfile defines three stages:

1. `builder`: installs dependencies and compiles TypeScript
2. `production`: installs only runtime dependencies and runs as a non-root user
3. `development`: includes dev dependencies and starts `npm run dev`

The production image exposes:

- `NODE_ENV=production`
- `PORT=3000`
- `APP_VERSION`, which can be passed from the CI pipeline build args

## CI/CD Workflow

The GitHub Actions workflow includes:

1. Build and lint
2. Tests and coverage upload
3. Security scanning with `npm audit`, Trivy, and Snyk
4. Docker image build and push
5. Staging, production, and rollback jobs as templates

Important: the deploy and rollback jobs are placeholders in this repository. They log the intended steps, but they do not perform a real deployment until you replace the example commands in `.github/workflows/ci-cd.yml` with commands for your platform.

## Health Response Example

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-03-17T18:30:00.000Z",
    "uptime": 3600,
    "version": "1.0.0",
    "environment": "production"
  }
}
```

## Security Notes

- The production container runs as a non-root user
- `helmet` adds HTTP security headers
- `npm audit` is part of the local and CI verification flow
- No secrets should be committed; use environment variables or CI secrets

## License

MIT License. See [LICENSE](LICENSE).
