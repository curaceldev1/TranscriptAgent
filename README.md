# TranscriptAgent

A powerful AI-powered transcript analysis and chat application that extracts content from various sources (YouTube videos, web pages, PDFs) and enables intelligent conversations about the extracted content.

## Features

- **Multi-Source Content Extraction**
  - YouTube video transcripts
  - Web page content
  - PDF documents
  - Automatic content processing and storage

- **AI-Powered Chat Interface**
  - Chat with your extracted content using AI
  - Reference multiple sources in conversations
  - Real-time message processing
  - Source-aware responses

- **Modern Web Application**
  - React + TypeScript frontend
  - Express.js backend with TypeScript
  - PostgreSQL database with Drizzle ORM
  - Real-time UI updates with React Query
  - Responsive design with Tailwind CSS and Radix UI

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** + **Radix UI** for styling and components
- **React Query** for data fetching and caching
- **Wouter** for client-side routing
- **React Hook Form** + **Zod** for form handling and validation

### Backend
- **Node.js** + **Express.js** with TypeScript
- **Drizzle ORM** with PostgreSQL
- **OpenAI API** integration for AI responses
- **Content extraction services** for multiple source types
- **WebSocket support** for real-time features

### Database
- **PostgreSQL** with Neon serverless
- **Drizzle ORM** for type-safe database operations
- Automated schema migrations

## Prerequisites

- Node.js 18+ 
- PostgreSQL database (or Neon serverless account)
- OpenAI API key

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/curaceldev1/TranscriptAgent.git
   cd TranscriptAgent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   OPENAI_API_KEY=your_openai_api_key
   NODE_ENV=development
   PORT=5000
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

## Development

**Start the development server:**
```bash
npm run dev
```

This will start both the frontend and backend in development mode. The application will be available at `http://localhost:5000`.

**Other useful commands:**
```bash
npm run check      # Type checking
npm run build      # Build for production
npm start          # Start production server
```

## Project Structure

```
TranscriptAgent/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and API client
│   │   └── hooks/          # Custom React hooks
│   └── index.html
├── server/                 # Express backend
│   ├── services/           # Business logic services
│   │   ├── contentExtractor.ts  # Content extraction logic
│   │   └── aiService.ts         # AI/OpenAI integration
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database layer
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema and types
└── package.json
```

## Usage

1. **Add Content Sources**
   - Navigate to the sidebar
   - Add URLs for YouTube videos, web pages, or upload PDFs
   - The system will automatically extract and process content

2. **Chat with Your Content**
   - Use the chat interface to ask questions about your sources
   - The AI will provide responses based on the extracted content
   - Reference multiple sources in a single conversation

3. **Manage Sources**
   - View all your added sources in the sidebar
   - Check processing status
   - Remove sources as needed

## API Endpoints

### Sources
- `GET /api/sources` - Get all sources
- `POST /api/sources` - Add a new source
- `DELETE /api/sources/:id` - Delete a source

### Messages
- `GET /api/messages` - Get chat messages
- `POST /api/messages` - Send a new message

### Content Extraction
- Automatic processing of YouTube videos, web pages, and PDFs
- Background processing with status updates
- Error handling and retry mechanisms

## Database Schema

### Sources Table
- `id` - Unique identifier
- `url` - Source URL
- `title` - Extracted title
- `type` - Source type (youtube, webpage, pdf)
- `status` - Processing status (processing, ready, error)
- `content` - Extracted content/transcript
- `created_at` - Creation timestamp
- `extracted_at` - Processing completion timestamp
- `error_message` - Error details if processing failed

### Messages Table
- `id` - Unique identifier
- `content` - Message content
- `role` - Message role (user, assistant)
- `source_ids` - Referenced source IDs
- `created_at` - Creation timestamp

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/curaceldev1/TranscriptAgent/issues) on GitHub.