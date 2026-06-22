module.exports = async function handler(req, res) {
  try {
    let payload = req.body || {};

    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch {
        payload = { raw_message: payload };
      }
    }

    // Detect PineConnector message
    const isPineConnector =
      typeof payload.raw_message === "string" ||
      (typeof req.body === "string" &&
        req.body.includes("buy,")) ||
      (typeof req.body === "string" &&
        req.body.includes("sell,"));

    if (isPineConnector) {
      const message =
        payload.raw_message || req.body;

      const pcResponse = await fetch(
        "https://webhook.pineconnector.com",
        {
          method: "POST",
          headers: {
            "Content-Type": "text/plain"
          },
          body: message
        }
      );

      return res.status(200).json({
        ok: true,
        route: "pineconnector",
        status: pcResponse.status
      });
    }

    // Journal payload
    const journalResponse = await fetch(
      `${process.env.VERCEL_URL}/api/engine-event`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const text = await journalResponse.text();

    return res.status(200).json({
      ok: true,
      route: "journal",
      result: text
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
};
