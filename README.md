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

The app is built once by GitHub Actions and deployed to **two targets** during the transition to GKE: **Cloud Run** (by the workflow) and **GKE** (by Terraform, manually). Both run the same image.

### Image build (GitHub Actions)

- **Dev** (`.github/workflows/release-dev.yml`, GitHub environment `dev`): triggered on push to `feature/**`, `issue/**`, `dev` or `main`.
- **Prod** (`.github/workflows/release-prod.yml`, GitHub environment `prod`): triggered on push to `main`.
- Changes to `docs/**` and Markdown files only don't trigger a release.

Each workflow builds the Docker image, pushes it to Artifact Registry as `europe-west1-docker.pkg.dev/<GCP project>/toto-react-supermarket/toto-react-supermarket:<version>` (where `<version>` is the `version` in `package.json`), and then deploys it to Cloud Run.

The `NEXT_PUBLIC_*` variables (API endpoints, Google client ID) are **baked into the image at build time** from the GitHub environment secrets managed by [toto-terra](https://github.com/nicolasances/toto-terra) (`toto-react-supermarket.tf`). Changing an endpoint means re-running the workflow, not restarting the pods.

### Versioning: bump the version for every GKE release

The image tag is the `package.json` `version`. **Bump it for every change you want to ship to GKE.** If you don't:

- the push overwrites the existing tag in Artifact Registry,
- Terraform sees no change in the image tag, so nothing is redeployed,
- the GKE pods keep running the old image (until they happen to restart and pull the overwritten tag).

Cloud Run is redeployed by the workflow on every push either way.

### Deploying on GKE

The app runs in the shared GKE Autopilot cluster, in the `dev` / `prod` namespaces, on its own hostname: `https://suppie.dev.dr.<domain>` (dev) and `https://suppie.dr.<domain>` (prod). The workload is defined in toto-terra-gke `workloads/toto-react-supermarket.tf`.

1. **Release the image:** bump `version` in `package.json`, merge, and wait for the workflow to push the image.
2. **toto-terra** (only when the infra changes): apply on both env projects (`totoexperiments`, `totolive`). It manages the endpoint secrets used at build time, read access to the registry for the GKE nodes, and the IAM roles of the pod's Workload Identity principal (used by the speech-to-text and text-to-speech API routes). If the endpoint secrets changed, re-run the workflow so the image is rebuilt.
3. **toto-terra-gke `cluster/`** (only when the hostnames/certificates change): apply, then wait for the certificate to be `ACTIVE`.
4. **toto-terra-gke `workloads/`:** set the new version in `TF_VAR_toto_react_supermarket_image_tag` (e.g. `{"dev":"1.0.0","prod":"1.0.0"}`) and apply.

The pods are probed on `GET /api/health`, which returns `200 {"status":"ok"}`. The container listens on port `3000`.

### Image retention

The GKE Deployment pins an image tag, so that tag must never be deleted from Artifact Registry, or the next pod restart fails to pull the image. The `toto-react-supermarket` registry has **no cleanup policy**: keep it that way, or use only a `KEEP most_recent_versions` rule, never a time-based `DELETE` rule (see toto-terra-gke `docs/operations.md`).

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
