export function GET() {
  return Response.json({
    NEXT_PUBLIC_TENANT_SLUG: process.env.NEXT_PUBLIC_TENANT_SLUG ?? '(not set)',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? '(not set)',
    NEXT_PUBLIC_USE_REAL_API: process.env.NEXT_PUBLIC_USE_REAL_API ?? '(not set)',
    NODE_ENV: process.env.NODE_ENV ?? '(not set)',
  })
}
