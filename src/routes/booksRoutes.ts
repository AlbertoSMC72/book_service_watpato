// src/routes/booksRoutes.ts
import { Router } from 'express';
import { BooksController } from '../controllers/booksController';
import { ChaptersController } from '../controllers/chaptersController';
import { CommentsController } from '../controllers/commentsController';
import { GenresController } from '../controllers/genresController';

const router = Router();

// ===== RUTAS DE GÉNEROS =====

/**
 * @swagger
 * /api/books/genres:
 *   get:
 *     summary: Obtener géneros ordenados por uso (más usado a menos usado)
 *     tags: [Genres]
 *     responses:
 *       200:
 *         description: Lista de géneros ordenados por popularidad
 */
router.get('/genres', GenresController.getGenresByUsage);

/**
 * @swagger
 * /api/books/genres:
 *   post:
 *     summary: Crear nuevos géneros
 *     tags: [Genres]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: array
 *                 items:
 *                   type: string
 *                   minLength: 2
 *                   maxLength: 50
 *     responses:
 *       201:
 *         description: Géneros creados exitosamente
 */
router.post('/genres', GenresController.createGenres);

// ===== RUTAS DE LIBROS =====

/**
 * @swagger
 * /api/books/:
 *   get:
 *     summary: Obtiene todos los libros publicados con información simplificada
 *     tags: [Books]
 *     description: Retorna solo ID, título, portada y primer género de cada libro
 *     responses:
 *       200:
 *         description: Lista de libros obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Libros obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "1"
 *                       title:
 *                         type: string
 *                         example: "El Gran Libro"
 *                       coverImage:
 *                         type: string
 *                         nullable: true
 *                         example: "data:image/jpeg;base64,..."
 *                       genre:
 *                         type: string
 *                         example: "Fantasía"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 */
router.get('/', BooksController.getAllBooksSimplified);


/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Crear un nuevo libro
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, authorId]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *               authorId:
 *                 type: integer
 *                 minimum: 1
 *               genreIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   minimum: 1
 *               newGenres:
 *                 type: array
 *                 items:
 *                   type: string
 *                   minLength: 2
 *                   maxLength: 50
 *               coverImage:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Libro creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', BooksController.createBook);

/**
 * @swagger
 * /api/books/{bookId}:
 *   get:
 *     summary: Obtener libro específico con capítulos
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario que solicita (para marcar capítulos liked)
 *     responses:
 *       200:
 *         description: Libro encontrado con capítulos y comentarios
 *       404:
 *         description: Libro no encontrado
 */
router.get('/:bookId', BooksController.getBookWithChapters);

/**
 * @swagger
 * /api/books/{bookId}:
 *   patch:
 *     summary: Actualizar información del libro
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *               genreIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   minimum: 1
 *               newGenres:
 *                 type: array
 *                 items:
 *                   type: string
 *                   minLength: 2
 *                   maxLength: 50
 *               coverImage:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Libro actualizado exitosamente
 *       404:
 *         description: Libro no encontrado
 */
router.patch('/:bookId', BooksController.updateBook);

/**
 * @swagger
 * /api/books/{bookId}/publish:
 *   patch:
 *     summary: Cambiar estado de publicación del libro
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [published]
 *             properties:
 *               published:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Estado de publicación actualizado
 */
router.patch('/:bookId/publish', BooksController.togglePublishStatus);

/**
 * @swagger
 * /api/books/{bookId}:
 *   delete:
 *     summary: Eliminar libro
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Libro eliminado exitosamente
 *       404:
 *         description: Libro no encontrado
 */
router.delete('/:bookId', BooksController.deleteBook);

/**
 * @swagger
 * /api/books/user/{userId}/favorites:
 *   get:
 *     summary: Obtener libros favoritos del usuario
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de libros favoritos
 */
router.get('/user/:userId/favorites', BooksController.getUserFavoriteBooks);

/**
 * @swagger
 * /api/books/user/{userId}/writing:
 *   get:
 *     summary: Obtener libros que el usuario está escribiendo
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de libros en proceso de escritura
 */
router.get('/user/:userId/writing', BooksController.getUserWritingBooks);

// ===== RUTAS DE CAPÍTULOS =====

/**
 * @swagger
 * /api/books/{bookId}/chapters:
 *   post:
 *     summary: Crear nuevo capítulo
 *     tags: [Chapters]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *     responses:
 *       201:
 *         description: Capítulo creado exitosamente
 */
router.post('/:bookId/chapters', ChaptersController.createChapter);

/**
 * @swagger
 * /api/books/chapters/{chapterId}:
 *   get:
 *     summary: Obtener contenido del capítulo con comentarios
 *     tags: [Chapters]
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Contenido del capítulo con comentarios
 *       404:
 *         description: Capítulo no encontrado
 */
router.get('/chapters/:chapterId', ChaptersController.getChapterContent);

/**
 * @swagger
 * /api/books/chapters/{chapterId}/content:
 *   post:
 *     summary: Agregar contenido al capítulo (por párrafos)
 *     tags: [Chapters]
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [paragraphs]
 *             properties:
 *               paragraphs:
 *                 type: array
 *                 items:
 *                   type: string
 *                   minLength: 10
 *     responses:
 *       201:
 *         description: Contenido agregado exitosamente
 */
router.post('/chapters/:chapterId/content', ChaptersController.addChapterContent);

/**
 * @swagger
 * /api/books/chapters/{chapterId}/publish:
 *   patch:
 *     summary: Publicar capítulo
 *     tags: [Chapters]
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [published]
 *             properties:
 *               published:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Estado de publicación del capítulo actualizado
 */
router.patch('/chapters/:chapterId/publish', ChaptersController.publishChapter);

/**
 * @swagger
 * /api/books/chapters/{chapterId}:
 *   delete:
 *     summary: Eliminar capítulo
 *     tags: [Chapters]
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Capítulo eliminado exitosamente
 */
router.delete('/chapters/:chapterId', ChaptersController.deleteChapter);

// ===== RUTAS DE COMENTARIOS =====

/**
 * @swagger
 * /api/books/{bookId}/comments:
 *   post:
 *     summary: Crear comentario en libro
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, comment]
 *             properties:
 *               userId:
 *                 type: integer
 *                 minimum: 1
 *               comment:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 1000
 *     responses:
 *       201:
 *         description: Comentario creado exitosamente
 */
router.post('/:bookId/comments', CommentsController.createBookComment);

/**
 * @swagger
 * /api/books/chapters/{chapterId}/comments:
 *   post:
 *     summary: Crear comentario en capítulo
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, comment]
 *             properties:
 *               userId:
 *                 type: integer
 *                 minimum: 1
 *               comment:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 1000
 *     responses:
 *       201:
 *         description: Comentario creado exitosamente
 */
router.post('/chapters/:chapterId/comments', CommentsController.createChapterComment);

/**
 * @swagger
 * /api/books/comments/{commentId}:
 *   delete:
 *     summary: Eliminar comentario de libro
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comentario eliminado exitosamente
 */
router.delete('/comments/:commentId', CommentsController.deleteBookComment);

/**
 * @swagger
 * /api/books/chapter-comments/{commentId}:
 *   delete:
 *     summary: Eliminar comentario de capítulo
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comentario eliminado exitosamente
 */
router.delete('/chapter-comments/:commentId', CommentsController.deleteChapterComment);



export default router;