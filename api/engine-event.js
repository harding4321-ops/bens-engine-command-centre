export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = req.body;

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await fetch(`${supabaseUrl}/rest/v1/engine_events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        source: "TradingView",
        event_type: payload.event_type || null,
        symbol: payload.symbol || payload.ticker || null,
        action: payload.action || null,
        side: payload.side || null,
        result: payload.result || null,
        why: payload.why || null,
        entry_price: payload.entry_price || payload.price || null,
        sl: payload.sl || null,
        tp1: payload.tp1 || null,
        raw_payload: payload
      })
    });

    const data = await response.text();

    if (!response.ok) {
      return res.status(500).json({ error: "Supabase insert failed", details: data });
    }

    return res.status(200).json({ ok: true, data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
