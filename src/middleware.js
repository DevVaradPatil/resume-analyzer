import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/blog(.*)',
  '/api/webhooks/clerk',
  // Public assets
  '/robots.txt',
  '/sitemap.xml',
  '/assets/(.*)',
]);

// Define routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/resume-analysis(.*)',
  '/analytics(.*)',
  '/section-improvement(.*)',
  '/dashboard(.*)',
  '/api/analyze(.*)',
  '/api/analyze-overall(.*)',
  '/api/improve-section(.*)',
  '/api/dashboard(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // If the route is protected, require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
