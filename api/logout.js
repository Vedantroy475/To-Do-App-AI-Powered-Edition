// api/logout.js
import cookie from "cookie";

export default async function handler(req, res) {
  const isProd = process.env.NODE_ENV === "production";
  const cookieStr = cookie.serialize("token", "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    expires: new Date(0)
  });
  res.setHeader('Set-Cookie', cookieStr);
  return res.status(200).json({ message: "logged out" });
}