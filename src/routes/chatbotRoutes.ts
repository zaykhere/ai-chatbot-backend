import { Router } from "express";
import { protect } from "../middlewares/auth";
import { addDomainToChatbot, createChatbot, deleteChatbot, getAllChatbots, publicChatbotQuery, queryChatbot, toggleWidget, updateDocument, uploadDocument, uploadMiddleware } from "../controllers/chatbot";
import { CorsOptions } from "cors";
import { getDb } from "../db";
import { chatbotDomains } from "../db/schema";
import { eq } from "drizzle-orm";
import cors from "cors";
import rateLimit from 'express-rate-limit';

const router = Router();
const db = getDb();

const corsOptions = async (
  req: any,
  callback: (err: Error | null, options?: CorsOptions) => void
) => {
  const { id } = req.params;
  try {
    const allowedDomains = await db
      .select({ domain: chatbotDomains.domain })
      .from(chatbotDomains)
      .where(eq(chatbotDomains.chatbotId, parseInt(id || "0")));

    const origin = req.get("Origin") || "";
    const isAllowed = allowedDomains.some(
      (d) => d.domain === origin || d.domain === "*"
    );

    callback(null, {
      origin: isAllowed ? origin : false,
      methods: ["POST"],
      allowedHeaders: ["Content-Type", "X-API-Key"],
    });
  } catch (error) {
    callback(null, { origin: false });
  }
};

const publicQueryLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // Limit to 100 requests per IP
  message: { error: 'Too many requests, please try again later' },
});

router.get("/all", protect, getAllChatbots)
router.post("/", protect, createChatbot);
router.post('/:chatbotId/document', protect, uploadMiddleware, uploadDocument);
router.put('/:chatbotId/document', protect, uploadMiddleware, updateDocument);
router.delete('/:chatbotId', protect, deleteChatbot);
router.post("/:chatbotId/query", protect, queryChatbot);
router.put("/:chatbotId/widget", protect, toggleWidget);
router.post("/domains", protect, addDomainToChatbot);
router.post("/public/:id/query", cors(corsOptions), publicQueryLimiter, publicChatbotQuery)

export {router as chatbotRouter}