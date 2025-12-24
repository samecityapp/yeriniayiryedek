import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { createClient } from "@supabase/supabase-js";

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
  : null;

const ratelimit = redis
  ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    analytics: true,
    prefix: "gnk-ratelimit",
  })
  : null;

const BOT_USER_AGENTS = [
  "googlebot",
  "bingbot",
  "slurp",
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "facebookexternalhit",
  "twitterbot",
  "rogerbot",
  "linkedinbot",
  "embedly",
  "quora link preview",
  "showyoubot",
  "outbrain",
  "pinterest",
  "slackbot",
  "vkshare",
  "w3c_validator",
  "whatsapp",
];

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

async function checkAdminAccess(req: NextRequest): Promise<boolean> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            cookie: req.headers.get("cookie") || "",
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    return profile?.is_admin === true;
  } catch (error) {
    console.error("Admin check error:", error);
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (
    path.startsWith("/_next") ||
    path.startsWith("/static") ||
    path.includes(".")
  ) {
    return NextResponse.next();
  }

  if (path.startsWith("/jilinrime")) {
    const isAdmin = await checkAdminAccess(req);

    if (!isAdmin) {
      // return NextResponse.redirect(new URL("/", req.url));
    }
  }

  const userAgent = req.headers.get("user-agent") || "";

  if (isBot(userAgent)) {
    return NextResponse.next();
  }

  // Rate Limiting Logic
  if (ratelimit) {
    const ip = req.ip || req.headers.get("x-forwarded-for") || "127.0.0.1";
    const isApiRoute = path.startsWith("/api");

    // Select the appropriate limiter
    // API: 10 requests per minute
    // Global: 60 requests per minute
    const limitType = isApiRoute ? "api" : "global";
    const limitCount = isApiRoute ? 10 : 60;

    // We use a different prefix for API vs Global to track them separately
    const limiter = Ratelimit.slidingWindow(limitCount, "1 m");
    const specificRatelimit = new Ratelimit({
      redis: redis!,
      limiter,
      analytics: true,
      prefix: `gnk-ratelimit-${limitType}`,
    });

    try {
      const { success, limit, remaining, reset } = await specificRatelimit.limit(ip);

      if (!success) {
        return new NextResponse(
          JSON.stringify({
            error: "Çok fazla istek gönderdiniz. Lütfen bir süre bekleyip tekrar deneyin.",
            limit,
            remaining,
            reset: new Date(reset).toISOString(),
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
              "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
            },
          }
        );
      }

      const response = NextResponse.next();

      // Add Rate Limit Headers
      response.headers.set("X-RateLimit-Limit", limit.toString());
      response.headers.set("X-RateLimit-Remaining", remaining.toString());
      response.headers.set("X-RateLimit-Reset", reset.toString());

      // Add Security Headers
      response.headers.set("X-Frame-Options", "DENY");
      response.headers.set("X-Content-Type-Options", "nosniff");
      response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

      return response;
    } catch (error) {
      console.error("Rate limit error:", error);
      // Fallback: allow request but log error
      const response = NextResponse.next();
      // Still add security headers even if rate limit fails
      response.headers.set("X-Frame-Options", "DENY");
      response.headers.set("X-Content-Type-Options", "nosniff");
      response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
      return response;
    }
  }

  // If no rate limiting (e.g. no Redis), still add security headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
