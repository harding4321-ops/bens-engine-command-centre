module.exports = async function handler(req, res) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        error: "Missing environment variables",
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      });
    }

    let payload = req.body || {};

    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch {
        payload = { raw_message: payload };
      }
    }

   const row = {
  source: payload.source || "TradingView",
  symbol: payload.symbol || payload.ticker || null,
  action: payload.action || payload.event_type || null,
  bias: payload.bias || null,
  session_name: payload.session || payload.session_name || null,
  opportunity: Number(payload.opportunity || 0) || null,
  entry_quality: Number(payload.entry_quality || payload.entry || 0) || null,
  direction_conf: Number(payload.direction_conf || payload.dir || 0) || null,
  fake_risk: Number(payload.fake_risk || payload.fake || 0) || null,
  trend_age: payload.trend_age || null,
  expansion: payload.expansion || null,
  expansion_score: Number(payload.expansion_score || 0) || null,
  pullback: payload.pullback || null,
  pullback_score: Number(payload.pullback_score || 0) || null,
  news_state: payload.news_state || payload.news || null,
  why: payload.why || payload.raw_message || null,
  entry_price: Number(payload.entry_price || payload.price || payload.entry_price_value || 0) || null,
  sl: Number(payload.sl || 0) || null,
  tp1: Number(payload.tp1 || payload.tp || 0) || null,
  result: payload.result || null,
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
      message: err.message
    });
  }
};
