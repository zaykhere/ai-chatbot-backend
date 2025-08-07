import { Router } from "express";
import { protect } from "../middlewares/auth";
import { createChatbot, getAllChatbots, queryChatbot, uploadDocument, uploadMiddleware } from "../controllers/chatbot";

const router = Router();

router.get("/all", protect, getAllChatbots)
router.post("/", protect, createChatbot);
router.post('/:chatbotId/document', protect, uploadMiddleware, uploadDocument);
router.post("/:chatbotId/query", protect, queryChatbot);

export {router as chatbotRouter}