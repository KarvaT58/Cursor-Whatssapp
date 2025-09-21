import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createRequestLogger } from '@/lib/logging/request-logger'

export async function middleware(request: NextRequest) {
  const requestLogger = createRequestLogger(request)
  
  try {
    // Log the incoming request
    requestLogger.logRequest()
    
    // Execute the session update
    const response = await updateSession(request)
    
    // Log the response
    requestLogger.logResponse(response)
    
    return response
  } catch (error) {
    // Log any errors
    requestLogger.logError(error as Error)
    throw error
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/webhooks (webhook endpoints - no auth required)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
