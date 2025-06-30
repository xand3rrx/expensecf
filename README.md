# Couple Expense Tracker

A simple expense tracking app for couples, built with React, TypeScript, and Cloudflare KV storage.

## Features

- User authentication with usernames
- Create and join couple groups
- Track shared expenses
- View expense history
- Real-time data persistence with Cloudflare KV

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Cloudflare KV

1. Go to your [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to Workers & Pages
3. Click on "KV" in the sidebar
4. Click "Create a namespace"
5. Name it "EXPENSE_TRACKER_KV"
6. Copy the namespace ID

### 3. Configure Wrangler

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Update `wrangler.toml` with your KV namespace ID:
```toml
[[kv_namespaces]]
binding = "EXPENSE_TRACKER_KV"
id = "your-actual-namespace-id"
preview_id = "your-actual-namespace-id"
```

### 4. Deploy the Worker

```bash
wrangler deploy
```

### 5. Deploy to Cloudflare Pages

1. Go to your Cloudflare Dashboard
2. Navigate to Workers & Pages
3. Click "Create a project"
4. Choose "Connect to Git"
5. Select your repository
6. Configure build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Framework preset: None (Custom)

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## How it Works

- **Storage**: Uses Cloudflare KV for persistent, shared data storage
- **Authentication**: Simple username-based login
- **Groups**: Couples can create groups and share group IDs
- **Expenses**: Track shared expenses within groups
- **Real-time**: Data is stored in Cloudflare's global network

## API Endpoints

The app uses a Cloudflare Worker at `/api/kv` to handle KV operations:

- `POST /api/kv` - Handle get/put/delete operations on KV storage

## Environment Variables

No environment variables are required for the frontend. The KV namespace is configured in `wrangler.toml`.

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```