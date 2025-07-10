import { Request, Response } from 'express';
import { GenresService } from '../services/genresService';

export class GenresController {

    static async getGenresByUsage(req: Request, res: Response): Promise<void> {
        try {
            const genres = await GenresService.getGenresByUsage();

            res.status(200).json({
                success: true,
                data: genres
            });

        } catch (error) {
            console.error('Error en getGenresByUsage:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    static async createGenres(req: Request, res: Response): Promise<void> {
        try {
            const { name } = req.body;

            if (!name || !Array.isArray(name) || name.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'El campo "name" es obligatorio y debe ser un array no vacío'
                });
                return;
            }

            const newGenre = await GenresService.createGenre(name);

            res.status(201).json({
                success: true,
                data: newGenre
            });

        } catch (error) {
            console.error('Error en createGenres:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}