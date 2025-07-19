import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors({ origin: '*', }));

app.use(express.json());
app.use(express.static("public"));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash" });

const PORT = 3000;
app.listen(PORT, () => { console.log(`Server sudah berjalan di http://localhost:${PORT}`); });


app.get("/", (req, res) => {
    res.send("Welcome To Gemini Wave 2 Session 5");
})

app.post("/chat", async (req, res) => {
    const { messages } = req.body; 
    if (!messages || messages.length === 0) {
        return res.status(400).json({ error: "No messages provided" });
    }
    try {
        const chatSession = model.startChat({
            history: messages,
        });

        const result = await chatSession.sendMessage(messages[messages.length - 1].parts[0].text  );
        const text = result.response.text();

        res.json({ result: text });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

