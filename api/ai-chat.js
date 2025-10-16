import OpenAI from "openai";

// Deepseek dùng OpenAI SDK nhưng baseURL khác
const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { message, code } = req.body;
  if (!message || !code) return res.status(400).json({ error: "Missing message or code" });

  try {
    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "Bạn là AI giúp sửa và kiểm tra code Python. Nếu code có lỗi, gợi ý sửa và trả code mới trong block ```python```." },
        { role: "user", content: `Code hiện tại:\n${code}\n\nHỏi: ${message}` }
      ]
    });

    let reply = completion.choices[0].message.content;

    // Nếu AI trả code mới, parse ra
    let updatedCode = null;
    const match = reply.match(/```python([\s\S]*?)```/);
    if (match) updatedCode = match[1].trim();

    res.status(200).json({ reply, updatedCode });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
