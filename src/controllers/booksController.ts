// src/controllers/booksController.ts
import { Request, Response } from 'express';
import { BooksService } from '../services/booksService';
import {
    createBookSchema,
    updateBookSchema,
    publishBookSchema
} from '../models/booksModels';

export class BooksController {

    static async getAllBooksSimplified(req: Request, res: Response): Promise<void> {
        try {
            const books = await BooksService.getAllBooksSimplified();
            res.status(200).json({
                success: true,
                message: 'Libros obtenidos exitosamente',
                data: books
            });

        } catch (error) {
            console.error('Error en getAllBooksSimplified:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    static async createBook(req: Request, res: Response): Promise<void> {
        try {
            const validationResult = createBookSchema.safeParse(req.body);

            if (!validationResult.success) {
                res.status(400).json({
                    success: false,
                    message: 'Datos inválidos',
                    errors: validationResult.error.errors
                });
                return;
            }

            const book = await BooksService.createBook(validationResult.data);

            res.status(201).json({
                success: true,
                message: 'Libro creado exitosamente',
                data: book
            });

        } catch (error) {
            console.error('Error en createBook:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    static async getBookWithChapters(req: Request, res: Response): Promise<void> {
        try {
            const bookId = parseInt(req.params.bookId);
            const userId = parseInt(req.query.userId as string);

            if (isNaN(bookId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de libro inválido'
                });
                return;
            }

            if (isNaN(userId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de usuario requerido'
                });
                return;
            }

            const book = await BooksService.getBookWithChapters(bookId, userId);

            if (!book) {
                res.status(404).json({
                    success: false,
                    message: 'Libro no encontrado'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: book
            });

        } catch (error) {
            console.error('Error en getBookWithChapters:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    static async updateBook(req: Request, res: Response): Promise<void> {
        try {
            const bookId = parseInt(req.params.bookId);

            if (isNaN(bookId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de libro inválido'
                });
                return;
            }

            const validationResult = updateBookSchema.safeParse(req.body);

            if (!validationResult.success) {
                res.status(400).json({
                    success: false,
                    message: 'Datos inválidos',
                    errors: validationResult.error.errors
                });
                return;
            }

            const book = await BooksService.updateBook(bookId, validationResult.data);

            if (!book) {
                res.status(404).json({
                    success: false,
                    message: 'Libro no encontrado'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Libro actualizado exitosamente',
                data: book
            });

        } catch (error) {
            console.error('Error en updateBook:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    static async togglePublishStatus(req: Request, res: Response): Promise<void> {
        try {
            const bookId = parseInt(req.params.bookId);

            if (isNaN(bookId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de libro inválido'
                });
                return;
            }

            const validationResult = publishBookSchema.safeParse(req.body);

            if (!validationResult.success) {
                res.status(400).json({
                    success: false,
                    message: 'Datos inválidos',
                    errors: validationResult.error.errors
                });
                return;
            }

            const book = await BooksService.togglePublishStatus(bookId, validationResult.data.published);

            if (!book) {
                res.status(404).json({
                    success: false,
                    message: 'Libro no encontrado'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: `Libro ${validationResult.data.published ? 'publicado' : 'despublicado'} exitosamente`,
                data: book
            });

        } catch (error) {
            console.error('Error en togglePublishStatus:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    static async deleteBook(req: Request, res: Response): Promise<void> {
        try {
            const bookId = parseInt(req.params.bookId);

            if (isNaN(bookId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de libro inválido'
                });
                return;
            }

            const success = await BooksService.deleteBook(bookId);

            if (!success) {
                res.status(404).json({
                    success: false,
                    message: 'Libro no encontrado'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Libro eliminado exitosamente'
            });

        } catch (error) {
            console.error('Error en deleteBook:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    static async getUserFavoriteBooks(req: Request, res: Response): Promise<void> {
        try {
            const userId = parseInt(req.params.userId);

            if (isNaN(userId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de usuario inválido'
                });
                return;
            }

            const books = await BooksService.getUserFavoriteBooks(userId);

            res.status(200).json({
                success: true,
                data: books
            });

        } catch (error) {
            console.error('Error en getUserFavoriteBooks:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    static async getUserWritingBooks(req: Request, res: Response): Promise<void> {
        try {
            const userId = parseInt(req.params.userId);

            if (isNaN(userId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de usuario inválido'
                });
                return;
            }

            const books = await BooksService.getUserWritingBooks(userId);

            res.status(200).json({
                success: true,
                data: books
            });

        } catch (error) {
            console.error('Error en getUserWritingBooks:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Buscar libros por texto similar
    static async searchBooks(req: Request, res: Response): Promise<void> {
        try {
            const { q, userId } = req.query;
            if (!q || typeof q !== 'string' || q.trim().length < 2) {
                res.status(400).json({
                    success: false,
                    message: 'Debe proporcionar un texto de búsqueda (mínimo 2 caracteres) en el parámetro "q".'
                });
                return;
            }
            const userIdNum = userId ? parseInt(userId as string) : undefined;
            const books = await BooksService.searchBooksByText(q, userIdNum);
            res.status(200).json({
                success: true,
                message: 'Resultados de búsqueda',
                data: books
            });
        } catch (error) {
            console.error('Error en searchBooks:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}