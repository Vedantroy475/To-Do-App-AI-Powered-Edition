// netlify/functions/_auth.js (ESM helper)
import jwt from "jsonwebtoken";
import cookie from "cookie";

export function getTokenPayloadFromEvent(event) {
  const headers = event.headers || {};
  const cookieHeader = headers.cookie || headers.Cookie || "";
  if (!cookieHeader) throw new Error("no-cookie");

  const cookies = cookie.parse(cookieHeader || "");
  const token = cookies.token;
  if (!token) throw new Error("no-token");

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload; // { userId, username, iat, exp }
  } catch (err) {
    throw new Error("invalid-token");
  }
}
