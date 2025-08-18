# 🤖 AI-Driven Chatbot Builder - Backend

  

A powerful backend service that enables users to create intelligent chatbots by uploading PDF documents and conversing with them using advanced RAG (Retrieval-Augmented Generation) technology.

  

## 🌟 Features

  

-  **📄 PDF Document Processing**: Upload and parse PDF documents for chatbot training

-  **🔐 User Authentication**: Secure user registration and login system with JWT tokens

-  **🧠 RAG Implementation**: Advanced Retrieval-Augmented Generation for contextual responses

-  **🔍 Vector Search**: OpenAI embeddings stored in ChromaDB for semantic similarity search

-  **💬 Conversational AI**: Interactive chat interface powered by OpenAI's language models

-  **🛡️ Security**: Rate limiting, CORS protection, and input validation

-  **📊 Logging**: Comprehensive logging with Winston for monitoring and debugging

-  **🚀 Production Ready**: Built with TypeScript, error handling, and graceful shutdown

  

## 🏗️ Architecture

  

```

PDF Upload ──► Text Processing ──► OpenAI Embeddings ──► ChromaDB Storage
   │                                                           │
   │                                                           │
   └─────────────────── RAG Pipeline ────────────────────────┘
                                │
                                ▼
User Query ──► Query Embedding ──► Vector Search ──► Context Retrieval
   │                                                       │
   │                                                       ▼
   └────────────► OpenAI API ◄─── Context + Query ◄───────┘
                     │
                     ▼
                AI Response

```

  

## 🛠️ Tech Stack

  

-  **Runtime**: Node.js with TypeScript

-  **Framework**: Express.js

-  **Database**: PostgreSQL (NeonDB)

-  **ORM**: Drizzle ORM

-  **Vector Database**: ChromaDB

-  **AI/ML**: OpenAI API

-  **Authentication**: JWT (JSON Web Tokens)

-  **File Processing**: Multer, PDF-Parse

-  **Security**: Helmet, CORS, bcrypt

-  **Logging**: Winston

-  **Validation**: Zod

  

## 📋 Prerequisites

  

- Node.js (v18 or higher)

- PostgreSQL database (NeonDB account)

- OpenAI API key

- ChromaDB instance

  

## 🚀 Installation

  

1.  **Clone the repository**

```bash

git clone https://github.com/zaykhere/ai-chatbot-backend.git

cd ai-chatbot-backend

```

  

2.  **Install dependencies**

```bash

npm install

```

  

3.  **Environment Setup**

Create a `.env` file in the root directory:

```env

# Server Configuration

PORT=3001

NODE_ENV=development

# Database Configuration (NeonDB)

DATABASE_URL=your_neon_database_url

# OpenAI Configuration

OPENAI_API_KEY=your_openai_api_key

# ChromaDB Configuration

CHROMA_DB_URL=your_chromadb_url

# JWT Configuration

JWT_SECRET=your_jwt_secret_key

JWT_EXPIRES_IN=7d

# Rate Limiting

RATE_LIMIT_WINDOW_MS=900000

RATE_LIMIT_MAX_REQUESTS=100

```

  

4.  **Database Setup**

```bash

# Generate migration files

npm run migrate:generate

# Apply migrations

npm run migrate:apply

```

  

## 🏃‍♂️ Running the Application

  

### Development Mode

```bash

npm  start

# or

npm  run  dev

```

  

### Production Build

```bash

npm  run  build

npm  run  start:prod

```

  

The server will start on `http://localhost:3001` (or your configured PORT).

  

## 📡 API Endpoints

  

### Authentication

-  `POST /api/auth/register` - User registration

-  `POST /api/auth/login` - User login

-  `GET /api/auth/profile` - Get user profile (protected)

  

### Document Management

-  `POST /api/documents/upload` - Upload PDF document (protected)

-  `GET /api/documents` - List user documents (protected)

-  `DELETE /api/documents/:id` - Delete document (protected)

  

### Chat

-  `POST /api/chat/:documentId` - Chat with a specific document (protected)

-  `GET /api/chat/:documentId/history` - Get chat history (protected)

  

### Health Check

-  `GET /api/health` - Service health status

  

## 🔧 Database Schema

  

The application uses Drizzle ORM with the following main entities:

  

-  **Users**: User authentication and profile information

-  **Documents**: Uploaded PDF documents and metadata

-  **Conversations**: Chat sessions between users and documents

-  **Messages**: Individual messages in conversations

  

## 🧩 Key Components

  

### RAG Pipeline

1.  **Document Ingestion**: PDFs are parsed and split into manageable chunks

2.  **Embedding Generation**: Text chunks are converted to vector embeddings using OpenAI

3.  **Vector Storage**: Embeddings are stored in ChromaDB for fast similarity search

4.  **Query Processing**: User queries are embedded and matched against stored vectors

5.  **Context Retrieval**: Relevant document chunks are retrieved based on similarity

6.  **Response Generation**: OpenAI generates responses using retrieved context

  

### Security Features

- JWT-based authentication

- Password hashing with bcrypt

- Rate limiting to prevent abuse

- CORS protection

- Input validation with Zod schemas

- SQL injection prevention with parameterized queries

  

## 📝 Scripts

  

| Script | Description |

|--------|-------------|

| `npm start` | Start development server with nodemon |

| `npm run dev` | Start development server with ts-node-dev |

| `npm run build` | Build TypeScript to JavaScript |

| `npm run migrate:generate` | Generate new database migrations |

| `npm run migrate:apply` | Apply pending migrations |

| `npm run migrate:undo` | Rollback migrations |

  

## 🔐 Environment Variables

  

| Variable | Description | Required |

|----------|-------------|----------|

| `PORT` | Server port | No (default: 3001) |

| `NODE_ENV` | Environment mode | No (default: development) |

| `DATABASE_URL` | PostgreSQL connection string | Yes |

| `OPENAI_API_KEY` | OpenAI API key | Yes |

| `CHROMA_DB_URL` | ChromaDB instance URL | Yes |

| `JWT_SECRET` | JWT signing secret | Yes |

  

## 📂 Project Structure

  

```

src/

├── controllers/ # Request handlers

├── middlewares/ # Express middlewares

├── models/ # Database models (Drizzle)

├── routes/ # API route definitions

├── services/ # Business logic layer

├── utils/ # Utility functions

├── types/ # TypeScript type definitions

├── db/ # Database configuration

└── index.ts # Application entry point

```

  

## 🧪 Testing

  

The application includes comprehensive error handling and logging for debugging:

  

-  **Winston Logger**: Structured logging for all application events

-  **Error Middleware**: Centralized error handling with proper HTTP status codes

-  **Database Connection Testing**: Automatic database connectivity verification on startup

  

## 🚀 Deployment

  

### Environment Setup

1. Set up a PostgreSQL database (NeonDB recommended)

2. Deploy ChromaDB instance

3. Configure environment variables

4. Run database migrations

  

### Build and Deploy

```bash

npm  run  build

npm  start

```

  




  



  

---

  

⭐ If you found this project helpful, please give it a star on GitHub!