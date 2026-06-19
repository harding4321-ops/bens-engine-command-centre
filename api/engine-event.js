export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const payload = req.body || {};

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      return res.status(500).json({ error: "Missing SUPABASE_URL" });
    }

    if (!supabaseKey) {
      return res.status(500).json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" });
    }

    const row = {
      source: "TradingView",
      event_type: payload.event_type || "TEST",
      symbol: payload.symbol || payload.ticker || "UNKNOWN",
      action: payload.action || null,
      side: payload.side || null,
      result: payload.result || null,
      why: payload.why || null,
      entry_price: payload.entry_price || payload.price || null,
      sl: payload.sl || null,
      tp1: payload.tp1 || null,
      raw_payload: payload
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/engine_events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify(row)
    });

    const text = await response.text();

    if (!response.ok) {
      return res.status(500).json({
        error: "Supabase insert failed",
        status: response.status,
        details: text,
        row
      });
    }

    return res.status(200).json({
      ok: true,
      inserted: text
    });

  } catch (err) {
    return res.status(500).json({
      error: "Function crashed",
      message: err.message,
      stack: err.stack
    });
  }
}
