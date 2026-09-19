export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { text, task, instruction, minWords } = req.body || {};

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: "Kein Text wurde übermittelt."
      });
    }

    if (text.length > 15000) {
      return res.status(400).json({
        error: "Der Text ist zu lang."
      });
    }

    const prompt = `
Du bist ein professioneller Deutschlektor und bewertest einen Text für ein digitales TestDaF-Schreibtraining.

WICHTIG:
- Bewerte ausschließlich den vorliegenden Text.
- Erfinde keine Fehler.
- Berücksichtige die konkrete Aufgabenstellung.
- Gib keine offizielle TestDaF-Note und keinen offiziellen TDN an.
- Die Bewertung ist ausschließlich eine KI-Trainingsbewertung.
- Sei konkret und pädagogisch hilfreich.
- Bei Fehlern: Zeige möglichst die fehlerhafte Form und eine bessere Korrektur.
- Bewerte nicht nur Grammatik, sondern auch Aufgabenbewältigung, Aufbau, Wortschatz und sprachliche Mittel.

AUFGABENSTELLUNG:
${task}

ARBEITSAUFTRAG:
${instruction}

MINDESTWORTZAHL:
${minWords}

TEXT DES TEILNEHMERS:
---
${text}
---

Erstelle deine Analyse auf Deutsch.

Verwende genau diese Struktur:

KI-TRAININGSANALYSE

Aufgabenbewältigung: X/5
Aufbau und Kohärenz: X/5
Wortschatz: X/5
Grammatik: X/5
Sprachliche Mittel: X/5
Gesamt: X/25

STÄRKEN
- ...

VERBESSERUNGSPUNKTE
- ...

FEHLER UND KORREKTUREN
- „Fehler“ → „Korrektur“ – kurze Erklärung
- ...

GESAMTFEEDBACK
Ein kurzer, konkreter Absatz darüber, was der Teilnehmer als Nächstes verbessern sollte.

Beurteile den Text fair. Ein sprachlich guter Text darf auch bei kleineren Fehlern eine hohe Bewertung erhalten.
`;

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
              content: prompt
            }
          ],
          max_completion_tokens: 3000
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Atria API error:", data);

      return res.status(response.status).json({
        error: data?.error?.message || "Atria API Fehler."
      });
    }

    const result =
      data?.choices?.[0]?.message?.content ||
      "Keine Analyse erhalten.";

    return res.status(200).json({
      result
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Interner Serverfehler."
    });
  }
}
