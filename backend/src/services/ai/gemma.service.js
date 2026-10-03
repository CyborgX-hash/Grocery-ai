const env = require('../../config/env');

const SYSTEM_PROMPT = `You are MessyList AI, an intelligent grocery parser designed to analyze chaotic, multi-message roommate chats in Hinglish (Hindi + English) and English.

Your objective:
1. Identify grocery items requested.
2. Extract quantities, units, and categories.
3. Detect brand/type preferences ("brown wali", "wahi jo last time li thi").
4. Resolve corrections, cancellations, and replacements ("actually Rahul eggs la raha", "wait don't get sugar", "get 2 instead of 1").
5. If an item is cancelled or brought by someone else, keep it in the list with "status": "cancelled" and set "notes" to explain why (e.g., "Rahul is bringing them").
6. Apply saved roommate preferences if an item is mentioned without specific brand overrides.
7. Return ONLY a valid JSON object matching the exact schema below. Do not wrap in markdown or commentary.

Output JSON Schema:
{
  "items": [
    {
      "name": "Milk",
      "quantity": 1,
      "unit": "packet",
      "category": "Dairy",
      "notes": "Amul Taaza (Roommate preference)",
      "status": "active",
      "confidence": 0.95
    },
    {
      "name": "Eggs",
      "quantity": 12,
      "unit": "pieces",
      "category": "Dairy & Eggs",
      "notes": "Cancelled: Rahul is bringing them",
      "status": "cancelled",
      "confidence": 0.99
    }
  ],
  "detectedLanguage": "Hinglish / English",
  "summary": "Brief summary of understood items and changes",
  "warnings": []
}`;

class GemmaService {
  constructor() {
    this.apiKey = env.gemma.apiKey;
    this.apiUrl = env.gemma.apiUrl;
    this.model = env.gemma.model;
  }

  /**
   * Parse messy text using Gemma API
   * @param {string} rawMessages
   * @param {Array} preferences - Saved user preferences
   */
  async parseMessages(rawMessages, preferences = []) {
    if (!this.apiKey) {
      throw new Error('Gemma API key is not configured.');
    }

    const preferencesContext = preferences.length > 0
      ? `Roommate Saved Preferences:\n${preferences
          .map(
            (p) =>
              `- ${p.itemName}: preferred "${p.preferredProduct}", default ${p.defaultQuantity} ${p.defaultUnit}${
                p.notes ? ` (${p.notes})` : ''
              }`
          )
          .join('\n')}`
      : 'No saved roommate preferences yet.';

    const userPrompt = `${preferencesContext}

Messy Roommate Messages:
"""
${rawMessages}
"""

Parse these messages now into the structured JSON schema. Output JSON only:`;

    // Support OpenAI-compatible endpoint / Hugging Face Inference API / Google AI Studio
    let response;
    const isHF = this.apiUrl.includes('huggingface.co');
    const isGoogle = this.apiUrl.includes('googleapis.com');

    if (isGoogle) {
      const url = `${this.apiUrl}?key=${this.apiKey}`;
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
      });
    } else if (isHF) {
      response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `<bos><start_of_turn>user\n${SYSTEM_PROMPT}\n\n${userPrompt}<end_of_turn>\n<start_of_turn>model\n`,
          parameters: {
            max_new_tokens: 1024,
            temperature: 0.1,
            return_full_text: false,
          },
        }),
      });
    } else {
      // Standard OpenAI-compatible format (vLLM, Ollama, OpenRouter, etc.)
      response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemma API returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return this.extractAndValidateJson(data, isGoogle, isHF);
  }

  extractAndValidateJson(data, isGoogle, isHF) {
    let rawText = '';
    if (isGoogle) {
      // Gemma 4 returns multiple parts: some with `thought: true` (internal reasoning)
      // and the actual response part without `thought`. We only want the non-thought text.
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const contentParts = parts.filter((p) => !p.thought);
      rawText = contentParts.map((p) => p.text).join('') || '';
    } else if (isHF) {
      if (Array.isArray(data) && data[0]?.generated_text) {
        rawText = data[0].generated_text;
      } else {
        rawText = typeof data === 'string' ? data : JSON.stringify(data);
      }
    } else {
      rawText = data?.choices?.[0]?.message?.content || '';
    }

    // Clean JSON markdown wrapper if present
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed.items)) {
        throw new Error('AI output missing items array');
      }
      return parsed;
    } catch (parseErr) {
      console.error('Failed to parse raw Gemma JSON:', rawText);
      throw new Error('Gemma returned malformed JSON response.');
    }
  }
}

module.exports = new GemmaService();
