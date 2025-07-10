import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import booksRoutes from './src/routes/booksRoutes';

// Import Swagger setup
import { setupSwagger } from './src/config/swagger';

// Import BigInt helper
import { setupBigIntSerialization } from './src/utils/bigintHelper';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Setup BigInt serialization for JSON responses
setupBigIntSerialization();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Setup Swagger documentation
setupSwagger(app);

// Routes
app.use('/api/books', booksRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Books Microservice is running',
    timestamp: new Date().toISOString(),
    service: 'books-microservice',
    version: '1.0.0'
  });
});

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Books Microservice API is working!',
    documentation: '/api-docs',
    endpoints: {
      books: 'POST /api/books - Crear libro',
      getBook: 'GET /api/books/:bookId?userId=X - Obtener libro con capítulos',
      updateBook: 'PATCH /api/books/:bookId - Actualizar libro',
      publishBook: 'PATCH /api/books/:bookId/publish - Publicar/despublicar libro',
      deleteBook: 'DELETE /api/books/:bookId - Eliminar libro',
      userFavorites: 'GET /api/books/user/:userId/favorites - Libros favoritos',
      userWriting: 'GET /api/books/user/:userId/writing - Libros del autor',
      createChapter: 'POST /api/books/:bookId/chapters - Crear capítulo',
      getChapter: 'GET /api/books/chapters/:chapterId - Obtener capítulo con contenido',
      addContent: 'POST /api/books/chapters/:chapterId/content - Agregar contenido',
      publishChapter: 'PATCH /api/books/chapters/:chapterId/publish - Publicar capítulo',
      deleteChapter: 'DELETE /api/books/chapters/:chapterId - Eliminar capítulo',
      bookComment: 'POST /api/books/:bookId/comments - Comentar libro',
      chapterComment: 'POST /api/books/chapters/:chapterId/comments - Comentar capítulo',
      deleteBookComment: 'DELETE /api/books/comments/:commentId - Eliminar comentario de libro',
      deleteChapterComment: 'DELETE /api/books/chapter-comments/:commentId - Eliminar comentario de capítulo',
      genres: 'GET /api/books/genres - Obtener géneros por uso'
    }
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    availableRoutes: {
      docs: '/api-docs',
      health: '/health',
      books: '/api/books'
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;

const prisma = new PrismaClient();

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection established.');

    app.listen(PORT, () => {
      console.log(`🚀 Books Microservice running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 Books endpoints available at: http://localhost:${PORT}/api/books`);
      console.log(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🎯 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();