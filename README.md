# Sharespace

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4500/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Supabase Setup

This project uses Supabase for database and storage. To set up your backend:

1.  **Database**: Run the contents of [supabase_setup.sql](./supabase_setup.sql) in your Supabase SQL Editor to create the necessary tables and RLS policies.
2.  **Storage**:
    - Create a new bucket named `uploads`.
    - Set the bucket to **Public**.
    - Add a policy to allow `SELECT` for everyone.
    - Add a policy to allow `INSERT` for authenticated users.
3.  **Environment Variables**: Update `src/app/services/supabase.client.ts` with your Supabase `URL` and `Anon Key`.


## Deployment

### Deploying to Vercel

1.  **Connect to GitHub**: Go to [vercel.com/new](https://vercel.com/new) and import this repository.
2.  **Framework Preset**: Select **Angular**.
3.  **Build Settings**: Leave as default (`pnpm build`).
4.  **Deployment**: Click **Deploy**.

Vercel will automatically handle your Angular builds and provide you with a production URL!
