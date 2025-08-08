import { chatbotDomains, chatbots } from "../db/schema";
import { Response } from "express";
import { getDb } from "../db";
import { sendError, sendSuccess } from "../utils/response";
import multer from 'multer';
import OpenAI from 'openai';
import { ChromaClient, EmbeddingFunction } from 'chromadb';
import { and, eq } from "drizzle-orm";
import pdfParse from 'pdf-parse';
import crypto from 'crypto';

const db = getDb();

// Configure Multer for in-memory storage with PDF filter and size limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const chromaClient = new ChromaClient({ path: 'http://localhost:8000' });

// Custom embedding function to bypass default embedding
class NoOpEmbeddingFunction implements EmbeddingFunction {
  async generate(): Promise<number[][]> {
    throw new Error('This function should not be called as embeddings are precomputed');
  }
}

export async function createChatbot(req: any, res: Response) {
  const { name } = req.body;
  let userId: string | number = req.user.id as string;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  userId = parseInt(userId, 10);

  const [chatbot] = await db
    .insert(chatbots)
    .values({ name, userId })
    .returning();

  sendSuccess(res, { chatbot }, 200)
}

function splitTextIntoChunks(text: string, chunkSize: number = 512, chunkOverlap: number = 50): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - chunkOverlap; // Move start forward, accounting for overlap
  }

  return chunks;
}

export async function uploadDocument(req: any, res: Response) {
  const { chatbotId } = req.params;
  const userId = req.user?.id;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Verify chatbot ownership
    const [chatbot] = await db
      .select()
      .from(chatbots)
      .where(
        and(
          eq(chatbots.id, parseInt(chatbotId)),
          eq(chatbots.userId, userId!)
        )
      );
    if (!chatbot) {
      sendError(res, "Chatbot not found", 404);
      return;
    }

    // Extract text from PDF
    const pdfData = await pdfParse(file.buffer);
    const content = pdfData.text;

    // Split text into chunks with overlap
    const chunks = splitTextIntoChunks(content, 500, 100);

    // Generate embeddings for each chunk
    const embeddings = await Promise.all(
      chunks.map(async (chunk, index) => {
        const embeddingResponse = await openai.embeddings.create({
          model: 'text-embedding-ada-002',
          input: chunk,
        });
        return {
          id: `${file.originalname}-${index}`,
          embedding: embeddingResponse.data[0].embedding,
          content: chunk,
        };
      })
    );

    // Store in ChromaDB
    const collection = await chromaClient.getOrCreateCollection({
      name: `chatbot_${chatbotId}`,
      embeddingFunction: new NoOpEmbeddingFunction(), // Use no-op embedding function
    });
    await collection.add({
      ids: embeddings.map((e) => e.id),
      documents: embeddings.map((e) => e.content),
      embeddings: embeddings.map((e) => e.embedding),
      metadatas: embeddings.map(() => ({ userId, chatbotId })),
    });

    sendSuccess(res, { message: "Document processed and embeddings stored" }, 200)
  } catch (error: any) {
    console.error(error);
    if (error.message === 'Only PDF files are allowed') {
      sendError(res, 'Only PDF files are allowed', 400);
      return;
    }
    if (error.message.includes('File too large')) {
      sendError(res, 'File size exceeds 5MB limit', 400);
      return;
    }
    sendError(res, 'File size exceeds 5MB limit', 500);
  }
}

export async function queryChatbot(req: any, res: Response) {
  const { chatbotId } = req.params;
  const { query } = req.body;
  const userId = req.user?.id;

  // Verify chatbot ownership

  const [chatbot] = await db
    .select()
    .from(chatbots)
    .where(
      and(
        eq(chatbots.id, parseInt(chatbotId)),
        eq(chatbots.userId, userId!)
      ));

  if (!chatbot) {
    sendError(res, "Chatbot not found", 404);
  }

  // Generate embedding for query
  const queryEmbeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: query,
  });
  const queryEmbedding = queryEmbeddingResponse.data[0].embedding;

  // Query ChromaDB
  const collection = await chromaClient.getCollection({ name: `chatbot_${chatbotId}` });
  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: 3,
  });

  const context = results.documents[0]?.join('\n') || '';

  // Generate response using OpenAI
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a helpful customer support chatbot.' },
      { role: 'user', content: `Context: ${context}\n\nQuery: ${query}` },
    ],
  });

  sendSuccess(res, {
    response: completion.choices[0].message.content,
    context
  }, 200)
}

export async function updateDocument(req: any, res: Response) {
  const { chatbotId } = req.params;
  const userId = req.user?.id;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Verify chatbot ownership
    const [chatbot] = await db
      .select()
      .from(chatbots)
      .where(
        and(
          eq(chatbots.id, parseInt(chatbotId, 10)),
          eq(chatbots.userId, userId!)
        )
      ).limit(1);
    if (!chatbot) {
      sendError(res, "Chatbot not found", 404);
    }

    // Delete existing ChromaDB collection
    try {
      await chromaClient.deleteCollection({ name: `chatbot_${chatbotId}` });
    } catch (error) {
      // Ignore if collection doesn't exist
      console.warn(`Collection chatbot_${chatbotId} not found, proceeding with new collection`);
    }

    // Extract text from PDF
    const pdfData = await pdfParse(file.buffer);
    const content = pdfData.text;

    // Split text into chunks with overlap
    const chunks = splitTextIntoChunks(content, 500, 100);

    // Generate embeddings for each chunk
    const embeddings = await Promise.all(
      chunks.map(async (chunk, index) => {
        const embeddingResponse = await openai.embeddings.create({
          model: 'text-embedding-ada-002',
          input: chunk,
        });
        return {
          id: `${file.originalname}-${index}`,
          embedding: embeddingResponse.data[0].embedding,
          content: chunk,
        };
      })
    );

    // Store in new ChromaDB collection
    const collection = await chromaClient.getOrCreateCollection({
      name: `chatbot_${chatbotId}`,
      embeddingFunction: new NoOpEmbeddingFunction(),
    });
    await collection.add({
      ids: embeddings.map((e) => e.id),
      documents: embeddings.map((e) => e.content),
      embeddings: embeddings.map((e) => e.embedding),
      metadatas: embeddings.map(() => ({ userId, chatbotId })),
    });

    res.json({ message: 'Document updated and new embeddings stored' });
  } catch (error: any) {
    console.error(error);
    if (error.message === 'Only PDF files are allowed') {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }
    if (error.message.includes('File too large')) {
      return res.status(400).json({ error: 'File size exceeds 5MB limit' });
    }
    res.status(500).json({ error: 'Failed to update document' });
  }
}

export async function getAllChatbots(req: any, res: Response) {
  const userId = req.user?.id;

  const chatbotData = await db.select().from(chatbots).where(eq(chatbots.userId, userId));

  sendSuccess(res, { chatbots: chatbotData }, 200);
}

export async function deleteChatbot(req: any, res: Response) {
  const { chatbotId } = req.params;
  const userId = req.user?.id;

  const [chatbot] = await db
    .select()
    .from(chatbots)
    .where(
      and(
        eq(chatbots.id, parseInt(chatbotId)),
        eq(chatbots.userId, userId!)
      ));

  if (!chatbot) {
    sendError(res, "Chatbot not found", 404);
  }


  await db.delete(chatbots).where(eq(chatbots.id, parseInt(chatbotId)));

  try {
    await chromaClient.deleteCollection({ name: `chatbot_${chatbotId}` });
  } catch (error) {
    console.warn(`Collection chatbot_${chatbotId} not found, proceeding with deletion`);
  }

  sendSuccess(res, null, 204);

}

export async function toggleWidget(req: any, res: Response) {
  const { chatbotId } = req.params;
  const userId = req.user?.id;

  const [chatbot] = await db
    .select()
    .from(chatbots)
    .where(
      and(
        eq(chatbots.id, parseInt(chatbotId, 10)),
        eq(chatbots.userId, parseInt(userId, 10))
      ));

  if (chatbot.apiKey) {
    await db
      .update(chatbots)
      .set({ apiKey: null })
      .where(eq(chatbots.id, parseInt(chatbotId, 10)));
    return;
  }

  const apiKey = crypto.randomBytes(32).toString('hex');
  await db
    .update(chatbots)
    .set({ apiKey })
    .where(eq(chatbots.id, parseInt(chatbotId, 10)));

  sendSuccess(res, { message: "Widget enabled", apiKey }, 200);
}

export async function addDomainToChatbot(req: any, res: Response) {
  const { chatbotId } = req.params;
  const { domain } = req.body;
  const userId = req.user?.id;

  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }

  const [chatbot] = await db
    .select()
    .from(chatbots)
    .where(
      and(
        eq(chatbots.id, parseInt(chatbotId, 10)),
        eq(chatbots.userId, parseInt(userId, 10))
      ));

  if (!chatbot) {
    sendError(res, "Chatbot not found", 404);
    return;
  }

  const [newDomain] = await db
    .insert(chatbotDomains)
    .values({ chatbotId: parseInt(chatbotId), domain })
    .returning();

  sendSuccess(res, { domain: newDomain }, 200);

}

export async function publicChatbotQuery(req: any, res: Response) {
  const { id } = req.params;
  const { query } = req.body;
  const apiKey = req.get('X-API-Key');

  const [chatbot] = await db
    .select()
    .from(chatbots)
    .where(eq(chatbots.id, parseInt(id)));
  if (!chatbot) {
    return sendError(res, "Chatbot not found", 404);
  }
  if (!chatbot.apiKey) {
    return sendError(res, "Widget not enabled for this chatbot", 403);
  }
  if (!apiKey || apiKey !== chatbot.apiKey) {
    return sendError(res, "Invalid API key", 401);
  }

  const queryEmbeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: query,
  });
  const queryEmbedding = queryEmbeddingResponse.data[0].embedding;

  // Query ChromaDB
  const collection = await chromaClient.getCollection({
    name: `chatbot_${id}`,
    embeddingFunction: new NoOpEmbeddingFunction(),
  });
  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: 5,
  });

  const context = results.documents[0]?.join('\n') || '';

  // Generate response using OpenAI
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a helpful customer support chatbot.' },
      { role: 'user', content: `Context: ${context}\n\nQuery: ${query}` },
    ],
  });

  sendSuccess(res, {
    response: completion.choices[0].message.content,
    context
  }, 200)
}

// Multer middleware for file upload
export const uploadMiddleware = upload.single('document');