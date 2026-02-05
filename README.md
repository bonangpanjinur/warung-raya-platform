# DesaMart - Marketplace UMKM & Desa Wisata

Marketplace UMKM asli desa dan destinasi wisata desa di Indonesia.

## Tech Stack

- **Frontend**: Vite, React, TypeScript
- **UI Components**: shadcn-ui, Tailwind CSS
- **Database & Auth**: Supabase
- **PWA**: vite-plugin-pwa

## Getting Started

### Prerequisites

- Node.js & pnpm (or npm/yarn)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/bonangpanjinur/remix-of-umkm-mitra.git
   cd remix-of-umkm-mitra
   ```

2. Install dependencies:
   ```sh
   pnpm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in your Supabase credentials.
   ```sh
   cp .env.example .env
   ```

4. Start the development server:
   ```sh
   pnpm dev
   ```

## Deployment

This project is configured for deployment on platforms like Vercel or Netlify. Ensure you set the environment variables in your deployment platform's settings.
