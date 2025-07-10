// src/controllers/commentsController.ts
import { Request, Response } from 'express';
import { CommentsService } from '../services/commentsService';
import {
    createBookCommentSchema,
    createChapterCommentSchema
} from '../models/booksModels';

export class CommentsController {

    static async createBookComment(req: Request, res: Response): Promise<void> {
        try {
            const bookId = parseInt(req.params.bookId);

            if (isNaN(bookId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de libro inválido'
                });
                return;
            }

            const validationResult = createBookCommentSchema.safeParse(req.body);

            if (!validationResult.success) {
                res.status(400).json({
                    success: false,
                    message: 'Datos inválidos',
                    errors: validationResult.error.errors
                });
                return;
            }

            const comment = await CommentsService.createBookComment(bookId, validationResult.data);

            res.status(201).json({
                success: true,
                message: 'Comentario creado exitosamente',
                data: comment
            });

        } catch (error) {
            console.error('Error en createBookComment:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    static async createChapterComment(req: Request, res: Response): Promise<void> {
        try {
            const chapterId = parseInt(req.params.chapterId);

            if (isNaN(chapterId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de capítulo inválido'
                });
                return;
            }

            const validationResult = createChapterCommentSchema.safeParse(req.body);

            if (!validationResult.success) {
                res.status(400).json({
                    success: false,
                    message: 'Datos inválidos',
                    errors: validationResult.error.errors
                });
                return;
            }

            const comment = await CommentsService.createChapterComment(chapterId, validationResult.data);

            res.status(201).json({
                success: true,
                message: 'Comentario creado exitosamente',
                data: comment
            });

        } catch (error) {
            console.error('Error en createChapterComment:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    static async deleteBookComment(req: Request, res: Response): Promise<void> {
        try {
            const commentId = parseInt(req.params.commentId);

            if (isNaN(commentId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de comentario inválido'
                });
                return;
            }

            const success = await CommentsService.deleteBookComment(commentId);

            if (!success) {
                res.status(404).json({
                    success: false,
                    message: 'Comentario no encontrado'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Comentario eliminado exitosamente'
            });

        } catch (error) {
            console.error('Error en deleteBookComment:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    static async deleteChapterComment(req: Request, res: Response): Promise<void> {
        try {
            const commentId = parseInt(req.params.commentId);

            if (isNaN(commentId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de comentario inválido'
                });
                return;
            }

            const success = await CommentsService.deleteChapterComment(commentId);

            if (!success) {
                res.status(404).json({
                    success: false,
                    message: 'Comentario no encontrado'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Comentario eliminado exitosamente'
            });

        } catch (error) {
            console.error('Error en deleteChapterComment:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}