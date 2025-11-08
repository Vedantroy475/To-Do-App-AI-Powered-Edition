// netlify/functions/logout.js
import cookie from "cookie";

export async function handler(event) {
  if (event.httpMethod !== "POST") return { statusCode: 405 };

  const isProd = process.env.NODE_ENV === "production";
  const cookieStr = cookie.serialize("token", "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    expires: new Date(0)
  });

  return {
    statusCode: 200,
    headers: { "Set-Cookie": cookieStr },
    body: JSON.stringify({ message: "logged out" })
  };
}
