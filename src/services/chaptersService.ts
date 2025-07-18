// src/services/chaptersService.ts
import { ChaptersRepository } from '../repos/chaptersRepository';
import { BooksRepository } from '../repos/booksRepository';
import {
  CreateChapterType,
  AddChapterContentType,
  ChapterResponse,
  ChapterWithContentResponse,
} from '../models/booksModels';

export class ChaptersService {

  static async createChapter(bookId: number, chapterData: CreateChapterType): Promise<ChapterResponse> {
    try {
      // Verificar que el libro existe
      const bookExists = await BooksRepository.bookExists(bookId);
      if (!bookExists) {
        throw new Error('El libro especificado no existe');
      }

      const chapter = await ChaptersRepository.createChapter(bookId, chapterData);


      return chapter;
    } catch (error) {
      console.error('Error en ChaptersService.createChapter:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al crear el capítulo');
    }
  }

  static async getChapterContent(chapterId: number): Promise<ChapterWithContentResponse | null> {
    try {
      const chapter = await ChaptersRepository.getChapterContent(chapterId);
      return chapter;
    } catch (error) {
      console.error('Error en ChaptersService.getChapterContent:', error);
      throw new Error('Error al obtener el contenido del capítulo');
    }
  }

  static async addChapterContent(chapterId: number, contentData: AddChapterContentType): Promise<any> {
    try {
      // Verificar que el capítulo existe
      const chapterExists = await ChaptersRepository.chapterExists(chapterId);
      if (!chapterExists) {
        throw new Error('El capítulo especificado no existe');
      }

      const paragraphs = await ChaptersRepository.addChapterContent(chapterId, contentData);
      return paragraphs;
    } catch (error) {
      console.error('Error en ChaptersService.addChapterContent:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al agregar contenido al capítulo');
    }
  }

  static async publishChapter(chapterId: number, published: boolean): Promise<ChapterResponse | null> {
    try {
      const chapter = await ChaptersRepository.publishChapter(chapterId, published);

      const bookData = await ChaptersRepository.chapterExists(chapterId);

      //Notificar a los seguidores del libro
      const url = `${process.env.NOTIFICATION_URL}/notify/book`;
      fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          "bookId": bookData.bookId,
          "title": bookData.title,
          "body": "El autor que sigues acaba de publicar un nuevo capítulo."
        }),
      });

      return chapter;
    } catch (error) {
      console.error('Error en ChaptersService.publishChapter:', error);
      throw new Error('Error al cambiar el estado de publicación del capítulo');
    }
  }

  static async deleteChapter(chapterId: number): Promise<boolean> {
    try {
      const success = await ChaptersRepository.deleteChapter(chapterId);
      return success;
    } catch (error) {
      console.error('Error en ChaptersService.deleteChapter:', error);
      throw new Error('Error al eliminar el capítulo');
    }
  }
}