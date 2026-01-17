---
alwaysApply: true
---

- TypeScript types should be categorised and created inside the `lib/types` directory and exported from `lib/types/index.ts`.
- Database queries should be done with react query and supabase `createClient` function and perform optimistic updates with caching.
- Any constant data should be created inside the `lib/constants` directory and exported from `lib/constants/index.ts`.
- React component should be small and broken down into smaller and reusable components inside the `/components` directory.
- Any helper function should be written in a reusable way inside the `lib/helpers` directory.
- Supabase database queries should be created inside `infra/db/repositories/client` for client components or `infra/db/repositories/server` for server components and they should be categorised based on the type of asset we're fetching unless it's a general query. Then a wrapper function should be created inside `lib/helpers/db`.
- When we need to display a message to the user after a database operation, use Shadcn sonner component.
- Always use Shadcn components instead of creating custom ones unless neccessary.
- Every feature page has Header and Main coming from '@/components/ui/header' and '@/components/ui/main' respectively.
- When importing files, import using the @ alias
- Always use skeleton components when we want to display a loading state of an asset in the database.
- Typescript types o the front end must match the backend types
- Anything related to supabase authentication like inviting users to signup or login must be created inside `infra/auth/helpers`
