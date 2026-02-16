# Toto Suppie

A smart shopping list application built with Next.js and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 16
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Language**: TypeScript
- **Authentication**: Google OAuth
- **Deployment**: Google Cloud Run

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

This application is configured to deploy to Google Cloud Run using GitHub Actions. 

- **Dev deployments**: Triggered on push to `feature/**`, `issue/**`, `dev`, or `main` branches
- **Production deployments**: Triggered on push to `release/**` branches

The workflows use GCP Artifact Registry for storing Docker images.

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
