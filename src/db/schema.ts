import { pgTable, serial, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
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