export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    let payload = req.body || {};

    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch {
        payload = { raw_message: payload };
      }
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        error: "Missing environment variables",
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      });
    }

    const row = {
      source: "TradingView",
      event_type: payload.event_type || payload.event || "UNKNOWN",
      symbol: payload.symbol || payload.ticker || null,
      action: payload.action || null,
      side: payload.side || null
