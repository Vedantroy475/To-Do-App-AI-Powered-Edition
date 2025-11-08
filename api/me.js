// netlify/functions/me.js
import { getTokenPayloadFromEvent } from "./_auth.js";

export async function handler(event) {
  try {
    const payload = getTokenPayloadFromEvent(event);
    return {
      statusCode: 200,
      body: JSON.stringify({ userId: payload.userId, username: payload.username })
    };
  } catch (err) {
    return { statusCode: 401, body: JSON.stringify({ error: "not authenticated" }) };
  }
}
