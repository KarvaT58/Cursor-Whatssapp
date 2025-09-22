import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  console.log('🔍 [MIDDLEWARE] Iniciando middleware para:', request.nextUrl.pathname)
  
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  console.log('🔍 [MIDDLEWARE] Usuário encontrado:', user ? `${user.email} (${user.id})` : 'NENHUM')

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/join/') && // 🔓 Permitir acesso público às páginas de entrada em grupos
    !request.nextUrl.pathname.startsWith('/api/groups/family/') && // 🔓 Permitir acesso público à API de família
    !request.nextUrl.pathname.startsWith('/api/groups/join-universal') && // 🔓 Permitir acesso público à API de join universal
    !request.nextUrl.pathname.startsWith('/api/cron') // 🔓 Permitir acesso público às rotas de cron
  ) {
    console.log('🔍 [MIDDLEWARE] Usuário não autenticado, verificando tipo de rota:', request.nextUrl.pathname)
    
    // Para rotas de API, retornar 401 em vez de redirecionar
    if (request.nextUrl.pathname.startsWith('/api/')) {
      console.log('🔍 [MIDDLEWARE] Retornando 401 para API:', request.nextUrl.pathname)
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    // Para páginas, redirecionar para login
    console.log('🔍 [MIDDLEWARE] Redirecionando para login:', request.nextUrl.pathname)
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  
  console.log('🔍 [MIDDLEWARE] Permitindo acesso para:', request.nextUrl.pathname)

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely.

  return supabaseResponse
}
