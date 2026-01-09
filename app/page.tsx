import ClientAuthGuard from '@/components/Home/ClientAuthGuard';

/**
 * Home page uses client-side auth guard with React Query caching
 * This provides instant UI updates when navigating back to the page
 * Server-side validation is still handled by middleware (proxy.ts)
 */
export default function Home() {
  return <ClientAuthGuard />;
}
