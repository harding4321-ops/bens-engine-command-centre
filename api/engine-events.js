module.exports = async function handler(req, res) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        error: "Missing Supabase environment variables",
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
      });
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/engine_events?select=*&order=created_at.desc&limit=100`,
      {
        method: "GET",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text = await response.text();

    if (!response.ok) {
      return res.status(500).json({
        error: "Supabase fetch failed",
        status: response.status,
        details: text,
      });
    }

    return res.status(200).json(JSON.parse(text));
  } catch (err) {
    return res.status(500).json({
      error: "Function crashed",
      details: err.message,
    });
  }
};
