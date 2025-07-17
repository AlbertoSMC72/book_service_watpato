// src/services/booksService.ts
import { BooksRepository } from '../repos/booksRepository';
import { GenresRepository } from '../repos/genresRepository';
import { 
  CreateBookType, 
  UpdateBookType,
  BookResponse,
  BookWithChaptersResponse
} from '../models/booksModels';

export class BooksService {

  static async getAllBooksSimplified(): Promise<Array<{
  id: string;
  title: string;
  coverImage: string | null;
  genre: string;
}>> {

  try {
    const books = await BooksRepository.getAllBooksSimplified();
    return books;
  } catch (error) {
    console.error('Error en BooksService.getAllBooksSimplified:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error al obtener todos los libros');
  }
}

  static async createBook(bookData: CreateBookType): Promise<BookResponse> {
    try {
      // Verificar que el autor existe
      const authorExists = await BooksRepository.userExists(bookData.authorId);
      if (!authorExists) {
        throw new Error('El autor especificado no existe');
      }

      // Procesar géneros nuevos si existen
      let allGenreIds: number[] = [];
      
      if (bookData.newGenres && bookData.newGenres.length > 0) {
        const newGenres = await GenresRepository.createMultipleGenres(bookData.newGenres);
        allGenreIds = newGenres.map(genre => parseInt(genre.id));
      }

      // Agregar géneros existentes
      if (bookData.genreIds && bookData.genreIds.length > 0) {
        const validGenres = await GenresRepository.validateGenres(bookData.genreIds);
        if (!validGenres) {
          throw new Error('Uno o más géneros no son válidos');
        }
        allGenreIds = [...allGenreIds, ...bookData.genreIds];
      }

      // Crear el libro
      const book = await BooksRepository.createBook({
        ...bookData,
        genreIds: allGenreIds
      });

      //Notificar a los seguidores del autor
      try {
        const url = `${process.env.NOTIFICATION_URL}/notify/author`;
        fetch(url, {
          method: 'POST',
          body: JSON.stringify({
            "authorId": bookData.authorId,
            "title": bookData.title,
            "body": "El autor que sigues acaba de publicar un nuevo libro."
          }),
        });
      } catch (notifyError) {
        console.error('Error al notificar a los seguidores del autor:', notifyError);
      }

      return book;
    } catch (error) {
      console.error('Error en BooksService.createBook:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al crear el libro');
    }
  }

  static async getBookWithChapters(bookId: number, userId: number): Promise<BookWithChaptersResponse | null> {
    try {
      const book = await BooksRepository.getBookWithChapters(bookId, userId);
      return book;
    } catch (error) {
      console.error('Error en BooksService.getBookWithChapters:', error);
      throw new Error('Error al obtener el libro con capítulos');
    }
  }

  static async updateBook(bookId: number, bookData: UpdateBookType): Promise<BookResponse | null> {
    try {
      // Verificar que el libro existe
      const bookExists = await BooksRepository.bookExists(bookId);
      if (!bookExists) {
        return null;
      }

      // Procesar géneros nuevos si existen
      let allGenreIds: number[] = [];
      
      if (bookData.newGenres && bookData.newGenres.length > 0) {
        const newGenres = await GenresRepository.createMultipleGenres(bookData.newGenres);
        allGenreIds = newGenres.map(genre => parseInt(genre.id));
      }

      // Agregar géneros existentes
      if (bookData.genreIds && bookData.genreIds.length > 0) {
        const validGenres = await GenresRepository.validateGenres(bookData.genreIds);
        if (!validGenres) {
          throw new Error('Uno o más géneros no son válidos');
        }
        allGenreIds = [...allGenreIds, ...bookData.genreIds];
      }

      // Actualizar el libro
      const book = await BooksRepository.updateBook(bookId, {
        ...bookData,
        genreIds: allGenreIds.length > 0 ? allGenreIds : undefined
      });

      return book;
    } catch (error) {
      console.error('Error en BooksService.updateBook:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al actualizar el libro');
    }
  }

  static async togglePublishStatus(bookId: number, published: boolean): Promise<BookResponse | null> {
    try {
      const book = await BooksRepository.togglePublishStatus(bookId, published);
      return book;
    } catch (error) {
      console.error('Error en BooksService.togglePublishStatus:', error);
      throw new Error('Error al cambiar el estado de publicación');
    }
  }

  static async deleteBook(bookId: number): Promise<boolean> {
    try {
      const success = await BooksRepository.deleteBook(bookId);
      return success;
    } catch (error) {
      console.error('Error en BooksService.deleteBook:', error);
      throw new Error('Error al eliminar el libro');
    }
  }

  static async getUserFavoriteBooks(userId: number): Promise<BookResponse[]> {
    try {
      const books = await BooksRepository.getUserFavoriteBooks(userId);
      return books;
    } catch (error) {
      console.error('Error en BooksService.getUserFavoriteBooks:', error);
      throw new Error('Error al obtener los libros favoritos');
    }
  }

  static async getUserWritingBooks(userId: number): Promise<BookResponse[]> {
    try {
      const books = await BooksRepository.getUserWritingBooks(userId);
      return books;
    } catch (error) {
      console.error('Error en BooksService.getUserWritingBooks:', error);
      throw new Error('Error al obtener los libros en escritura');
    }
  }
}