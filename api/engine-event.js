module.exports = async function handler(req, res) {
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
      side: payload.side || null,
      result: payload.result || null,
      why: payload.why || payload.raw_message || null,
      entry_price: Number(payload.entry_price || payload.price || payload.entry || 0) || null,
      sl: Number(payload.sl || 0) || null,
      tp1: Number(payload.tp1 || payload.tp || 0) || null,
      raw_payload: payload
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/engine_events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "return=representation"
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
      message: err.message
    });
  }
};
