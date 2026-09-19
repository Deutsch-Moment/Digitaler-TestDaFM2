export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const response = await fetch(
      "https://api.atria-asi.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.ATRIA_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "Atria-Dawn-Preview",
          messages: [
            {
              role: "user",
              content: "Antworte nur mit: Atria funktioniert."
            }
          ],
          max_completion_tokens: 50
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({
      result: data.choices?.[0]?.message?.content || "Keine Antwort"
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
