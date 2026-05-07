import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public paths that don't need auth
  const publicPaths = ["/", "/login", "/auth/callback", "/subscribe", "/api/stripe/webhook"];
  const isPublic = publicPaths.some(p => pathname === p || pathname.startsWith("/api/stripe/webhook"));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If logged in, check subscription on protected routes
  if (user && !isPublic && pathname !== "/subscribe" && pathname !== "/onboarding") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status, username")
      .eq("id", user.id)
      .single();

    // No profile yet → onboarding
    if (!profile?.username && pathname !== "/onboarding") {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }

    // No active subscription → subscribe page
    if (profile?.subscription_status !== "active" && pathname !== "/onboarding") {
      const url = request.nextUrl.clone();
      url.pathname = "/subscribe";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
