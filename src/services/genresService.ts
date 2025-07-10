// src/services/genresService.ts
import { GenresRepository } from '../repos/genresRepository';
import { GenreUsageResponse } from '../models/booksModels';

export class GenresService {
  
  static async getGenresByUsage(): Promise<GenreUsageResponse[]> {
    try {
      const genres = await GenresRepository.getGenresByUsage();
      return genres;
    } catch (error) {
      console.error('Error en GenresService.getGenresByUsage:', error);
      throw new Error('Error al obtener los géneros por uso');
    }
  }

  static async createGenre(name: string[]): Promise<any> {
    try {
      const newGenre = await GenresRepository.createMultipleGenres(name);
      return newGenre;
    } catch (error) {
      console.error('Error en GenresService.createGenre:', error);
      throw new Error('Error al crear el género');
    }
  }
}