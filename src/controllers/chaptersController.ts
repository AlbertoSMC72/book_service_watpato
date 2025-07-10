// src/controllers/chaptersController.ts
import { Request, Response } from 'express';
import { ChaptersService } from "../services/chaptersService"
import {
    createChapterSchema,
    addChapterContentSchema,
    publishChapterSchema
} from '../models/booksModels';

export class ChaptersController {

    static async createChapter(req: Request, res: Response): Promise<void> {
        try {
            const bookId = parseInt(req.params.bookId);

            if (isNaN(bookId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de libro inválido'
                });
                return;
            }

            const validationResult = createChapterSchema.safeParse(req.body);

            if (!validationResult.success) {
                res.status(400).json({
                    success: false,
                    message: 'Datos inválidos',
                    errors: validationResult.error.errors
                });
                return;
            }

            const chapter = await ChaptersService.createChapter(bookId, validationResult.data);

            res.status(201).json({
                success: true,
                message: 'Capítulo creado exitosamente',
                data: chapter
            });

        } catch (error) {
            console.error('Error en createChapter:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    static async getChapterContent(req: Request, res: Response): Promise<void> {
        try {
            const chapterId = parseInt(req.params.chapterId);

            if (isNaN(chapterId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de capítulo inválido'
                });
                return;
            }

            const chapter = await ChaptersService.getChapterContent(chapterId);

            if (!chapter) {
                res.status(404).json({
                    success: false,
                    message: 'Capítulo no encontrado'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: chapter
            });

        } catch (error) {
            console.error('Error en getChapterContent:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    static async addChapterContent(req: Request, res: Response): Promise<void> {
        try {
            const chapterId = parseInt(req.params.chapterId);

            if (isNaN(chapterId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de capítulo inválido'
                });
                return;
            }

            const validationResult = addChapterContentSchema.safeParse(req.body);

            if (!validationResult.success) {
                res.status(400).json({
                    success: false,
                    message: 'Datos inválidos',
                    errors: validationResult.error.errors
                });
                return;
            }

            const paragraphs = await ChaptersService.addChapterContent(chapterId, validationResult.data);

            res.status(201).json({
                success: true,
                message: 'Contenido agregado exitosamente',
                data: paragraphs
            });

        } catch (error) {
            console.error('Error en addChapterContent:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    static async publishChapter(req: Request, res: Response): Promise<void> {
        try {
            const chapterId = parseInt(req.params.chapterId);

            if (isNaN(chapterId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de capítulo inválido'
                });
                return;
            }

            const validationResult = publishChapterSchema.safeParse(req.body);

            if (!validationResult.success) {
                res.status(400).json({
                    success: false,
                    message: 'Datos inválidos',
                    errors: validationResult.error.errors
                });
                return;
            }

            const chapter = await ChaptersService.publishChapter(chapterId, validationResult.data.published);

            if (!chapter) {
                res.status(404).json({
                    success: false,
                    message: 'Capítulo no encontrado'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: `Capítulo ${validationResult.data.published ? 'publicado' : 'despublicado'} exitosamente`,
                data: chapter
            });

        } catch (error) {
            console.error('Error en publishChapter:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    static async deleteChapter(req: Request, res: Response): Promise<void> {
        try {
            const chapterId = parseInt(req.params.chapterId);

            if (isNaN(chapterId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de capítulo inválido'
                });
                return;
            }

            const success = await ChaptersService.deleteChapter(chapterId);

            if (!success) {
                res.status(404).json({
                    success: false,
                    message: 'Capítulo no encontrado'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Capítulo eliminado exitosamente'
            });

        } catch (error) {
            console.error('Error en deleteChapter:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}