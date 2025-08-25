import { pgTable, serial, varchar, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';

// Enum for message roles
export const messageRoleEnum = pgEnum('message_role', ['system', 'user', 'assistant']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', {length: 255}),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

export const chatbots = pgTable('chatbots', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  apiKey: text('api_key').unique(), // Optional, only set when widget is enabled
});

export const chatbotDomains = pgTable('chatbot_domains', {
  id: serial('id').primaryKey(),
  chatbotId: integer('chatbot_id').notNull().references(() => chatbots.id),
  domain: text('domain').notNull(),
});

export const chatSessions = pgTable('chat_sessions', {
  id: serial('id').primaryKey(),
  chatbotId: integer('chatbot_id').notNull().references(() => chatbots.id),
  title: varchar('title', { length: 255 }), // optional
  userId: integer('user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

// Each message in a session
export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').notNull().references(() => chatSessions.id),
  role: messageRoleEnum('role').notNull(),
  content: text('content').notNull(),
  metadata: text('metadata'), // optional: store sources, citations, embeddings, etc.
  createdAt: timestamp('created_at').notNull().defaultNow(),
});