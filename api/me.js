// api/me.js
import { getTokenPayloadFromRequest } from "./_auth.js";

export default async function handler(req, res) {
  try {
    const payload = getTokenPayloadFromRequest(req);
    return res.status(200).json({ userId: payload.userId, username: payload.username });
  } catch (err) {
    return res.status(401).json({ error: "not authenticated" });
  }
}