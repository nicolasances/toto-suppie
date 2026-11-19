# Toto Suppie

A smart shopping list application built with Next.js and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 16
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Language**: TypeScript
- **Authentication**: Google OAuth
- **Deployment**: Google Cloud Run and GKE (Autopilot, shared cluster managed by [toto-terra-gke](https://github.com/nicolasances/toto-terra-gke))

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_AUTH_API_ENDPOINT=<your-auth-api-endpoint>
NEXT_PUBLIC_SUPERMARKET_API_ENDPOINT=<your-supermarket-api-endpoint>
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-google-client-id>
```

### Development

Install dependencies:

```bash
npm install
```

Run the unit tests (Mocha):

```bash
npm test
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

### Docker

Build the Docker image:

```bash
docker build --build-arg AUTH_API_ENDPOINT=<endpoint> \
  --build-arg SUPERMARKET_API_ENDPOINT=<endpoint> \
  --build-arg GOOGLE_CLIENT_ID=<client-id> \
  -t toto-suppie .
```

Run the container:

```bash
docker run -p 3000:3000 toto-suppie
```

## Deployment

The app is built once by GitHub Actions and deployed to **two targets** during the transition to GKE: **Cloud Run** and **GKE**. Both run the same image, and both are deployed by the workflow.

Terraform ([toto-terra-gke](https://github.com/nicolasances/toto-terra-gke)) owns the *shape* of the GKE workload (Deployment, Service, route, resources, probes, env). CI owns *which image runs*: it runs `kubectl set image` and waits for `kubectl rollout status`. A later `terraform apply` doesn't revert the image.

### Branches and environments

- **Dev** (`.github/workflows/release-dev.yml`, GitHub environment `dev`, namespace `dev`): triggered on push to `feature/**`, `issue/**` or `dev`.
- **Prod** (`.github/workflows/release-prod.yml`, GitHub environment `prod`, namespace `prod`): triggered on push to `main`. `main` does **not** deploy to dev.
- Changes to `docs/**` and Markdown files only don't trigger a release.
- Deploys to the same environment are serialized (`concurrency` groups `deploy-dev` and `deploy-prod`).

Each workflow builds the Docker image, pushes it to Artifact Registry as `europe-west1-docker.pkg.dev/<GCP project>/toto-react-supermarket/toto-react-supermarket:<tag>`, deploys it to Cloud Run, then to GKE. The job fails if the GKE rollout doesn't complete within 5 minutes. There is no automatic rollback: push a fix or run `kubectl rollout undo`.

The GKE project, cluster, location and namespace come from the GitHub environment variables `GKE_PROJECT_ID`, `GKE_CLUSTER_NAME`, `GKE_CLUSTER_LOCATION` and `GKE_NAMESPACE` (managed by [toto-terra](https://github.com/nicolasances/toto-terra)). Authentication uses the `toto-cicd` key (`CICD_SERVICE_ACCOUNT`).

The `NEXT_PUBLIC_*` variables (API endpoints, Google client ID) are **baked into the image at build time** from the GitHub environment secrets managed by toto-terra (`toto-react-supermarket.tf`). Changing an endpoint means re-running the workflow, not restarting the pods.

### Image tags and versioning

- **Dev:** `<package.json version>-<short sha>`, e.g. `1.0.0-a1b2c3d`. Every commit gets a unique tag, so **no version bump is needed on feature branches**. Re-running the job for the same commit skips the build and push and redeploys the existing image.
- **Prod:** `<package.json version>` only. **Every merge to `main` needs a version bump**: before building, the workflow fails with "Bump the version in package.json" if the tag already exists in the prod registry.

### Deploying on GKE

The app runs in the shared GKE Autopilot cluster, in the `dev` / `prod` namespaces, on its own hostname: `https://suppie.dev.dr.<domain>` (dev) and `https://suppie.dr.<domain>` (prod). The workload is defined in toto-terra-gke `workloads/toto-react-supermarket.tf`.

1. **Release the image:** push to a feature branch for dev; for prod, bump `version` in `package.json` and merge to `main`. The workflow deploys to GKE.
2. **toto-terra** (only when the infra changes): apply on both env projects (`totoexperiments`, `totolive`). It manages the endpoint secrets used at build time, the GitHub environment variables, read access to the registry for the GKE nodes, and the IAM roles of the pod's Workload Identity principal (used by the speech-to-text and text-to-speech API routes). If the endpoint secrets changed, re-run the workflow so the image is rebuilt.
3. **toto-terra-gke `cluster/`** (only when the hostnames/certificates change): apply, then wait for the certificate to be `ACTIVE`.
4. **toto-terra-gke `workloads/`** (only when the Deployment shape changes): apply. The image is ignored by Terraform.

To check what runs: `kubectl -n dev get deploy toto-react-supermarket -o jsonpath='{..image}'`.

The pods are probed on `GET /api/health`, which returns `200 {"status":"ok"}`. The container listens on port `3000`.

### Image retention

The GKE Deployment pins an image tag, so a running tag must not be deleted from Artifact Registry, or the next pod restart fails to pull the image. The `toto-react-supermarket` registry has a cleanup policy that **keeps the 10 most recent versions** and deletes versions older than 7 days; the KEEP rule wins over the DELETE rule. Policy is managed in toto-terra. If a pod runs an older image than the 10 most recent, redeploy a current one (see toto-terra-gke `docs/operations.md`).

## Project Structure

```
toto-suppie/
├── app/                    # Next.js app directory
│   ├── components/        # React components
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── api/                   # API client layer
├── auth/                  # Authentication utilities
├── components/           # Shared UI components
│   └── ui/              # Shadcn/ui components
├── lib/                  # Utility functions
├── model/                # TypeScript models
├── public/               # Static assets
│   ├── images/
│   └── lottie/
└── Config.ts             # Configuration

```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn/ui](https://ui.shadcn.com)
