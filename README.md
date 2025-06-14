# Composia

Composia is a Next.js application that provides a component based page builder. The admin interface lets you compose pages from reusable components and store them in MongoDB. At runtime the saved component tree is rendered to create dynamic pages.

## Features

- Visual page builder in the `/admin` section
- Components for forms, buttons, text blocks, dates and more
- Pages and versions stored in MongoDB
- Authentication handled by Clerk
- Internationalisation with `next-intl`
- Dark/light theme support

## Installation

1. Clone the repository

```bash
git clone <repository-url>
cd composia
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file and define your environment variables

```
MONGODB_URI=<your mongodb connection string>
MONGODB_DB=<database name>
# Clerk keys if using authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your key>
CLERK_SECRET_KEY=<your secret>
```

4. Start the development server

```bash
npm run dev
```

Open <http://localhost:3000> in your browser to view the app.

## Production build

```bash
npm run build
npm start
```

