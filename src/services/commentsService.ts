// src/services/commentsService.ts
import { CommentsRepository } from '../repos/commentsRepository';
import { BooksRepository } from '../repos/booksRepository';
import { ChaptersRepository } from '../repos/chaptersRepository';
import { 
  CreateBookCommentType, 
  CreateChapterCommentType,
  CommentResponse
} from '../models/booksModels';

export class CommentsService {
  
  static async createBookComment(bookId: number, commentData: CreateBookCommentType): Promise<CommentResponse> {
    try {
      // Verificar que el libro existe
      const bookExists = await BooksRepository.bookExists(bookId);
      if (!bookExists) {
        throw new Error('El libro especificado no existe');
      }

      // Verificar que el usuario existe
      const userExists = await BooksRepository.userExists(commentData.userId);
      if (!userExists) {
        throw new Error('El usuario especificado no existe');
      }

      const comment = await CommentsRepository.createBookComment(bookId, commentData);
      return comment;
    } catch (error) {
      console.error('Error en CommentsService.createBookComment:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al crear el comentario');
    }
  }

  static async createChapterComment(chapterId: number, commentData: CreateChapterCommentType): Promise<CommentResponse> {
    try {
      // Verificar que el capítulo existe
      const chapterExists = await ChaptersRepository.chapterExists(chapterId);
      if (!chapterExists) {
        throw new Error('El capítulo especificado no existe');
      }

      // Verificar que el usuario existe
      const userExists = await BooksRepository.userExists(commentData.userId);
      if (!userExists) {
        throw new Error('El usuario especificado no existe');
      }

      const comment = await CommentsRepository.createChapterComment(chapterId, commentData);
      return comment;
    } catch (error) {
      console.error('Error en CommentsService.createChapterComment:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al crear el comentario');
    }
  }

  static async deleteBookComment(commentId: number): Promise<boolean> {
    try {
      const success = await CommentsRepository.deleteBookComment(commentId);
      return success;
    } catch (error) {
      console.error('Error en CommentsService.deleteBookComment:', error);
      throw new Error('Error al eliminar el comentario');
    }
  }

  static async deleteChapterComment(commentId: number): Promise<boolean> {
    try {
      const success = await CommentsRepository.deleteChapterComment(commentId);
      return success;
    } catch (error) {
      console.error('Error en CommentsService.deleteChapterComment:', error);
      throw new Error('Error al eliminar el comentario');
    }
  }
}