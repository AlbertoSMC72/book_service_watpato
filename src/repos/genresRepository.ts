// src/repos/genresRepository.ts
import { PrismaClient } from '@prisma/client';
import { serializeBigInt } from '../utils/bigintHelper';
import { GenreUsageResponse } from '../models/booksModels';

const prisma = new PrismaClient();

export class GenresRepository {

    static async getGenresByUsage(): Promise<GenreUsageResponse[]> {
        try {
            // Query para obtener géneros ordenados por uso
            const genresWithUsage = await prisma.$queryRaw`
                SELECT 
                    g.id,
                    g.name,
                    COUNT(bg.book_id) as usage_count,
                    ROUND(
                        (COUNT(bg.book_id)::decimal / 
                         NULLIF((SELECT COUNT(*) FROM book_genres), 0)) * 100, 
                        2
                    ) as percentage
                FROM genres g
                LEFT JOIN book_genres bg ON g.id = bg.genre_id
                GROUP BY g.id, g.name
                ORDER BY usage_count DESC, g.name ASC
            ` as any[];

            const result = genresWithUsage.map(genre => ({
                id: genre.id.toString(),
                name: genre.name,
                usage_count: parseInt(genre.usage_count.toString()),
                percentage: parseFloat(genre.percentage || '0')
            }));

            return serializeBigInt(result);
        } catch (error) {
            console.error('Error en GenresRepository.getGenresByUsage:', error);
            throw error;
        }
    }

    static async createMultipleGenres(genreNames: string[]): Promise<Array<{ id: string; name: string }>> {
        try {
            const genres = await Promise.all(
                genreNames.map(async (name) => {
                    // Usar upsert para evitar duplicados
                    const genre = await prisma.genre.upsert({
                        where: { name: name.toLowerCase().trim() },
                        update: {},
                        create: { name: name.toLowerCase().trim() }
                    });
                    return {
                        id: genre.id.toString(),
                        name: genre.name
                    };
                })
            );

            return serializeBigInt(genres);
        } catch (error) {
            console.error('Error en GenresRepository.createMultipleGenres:', error);
            throw error;
        }
    }

    static async validateGenres(genreIds: number[]): Promise<boolean> {
        try {
            const existingGenres = await prisma.genre.findMany({
                where: {
                    id: {
                        in: genreIds.map(id => BigInt(id))
                    }
                },
                select: { id: true }
            });

            return existingGenres.length === genreIds.length;
        } catch (error) {
            console.error('Error en GenresRepository.validateGenres:', error);
            return false;
        }
    }

    static async getAllGenres(): Promise<Array<{ id: string; name: string }>> {
        try {
            const genres = await prisma.genre.findMany({
                select: {
                    id: true,
                    name: true
                },
                orderBy: { name: 'asc' }
            });

            const result = genres.map(genre => ({
                id: genre.id.toString(),
                name: genre.name
            }));

            return serializeBigInt(result);
        } catch (error) {
            console.error('Error en GenresRepository.getAllGenres:', error);
            throw error;
        }
    }
}