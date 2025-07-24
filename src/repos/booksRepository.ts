// src/repos/booksRepository.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { serializeBigInt } from '../utils/bigintHelper';
import {
    CreateBookType,
    UpdateBookType,
    BookResponse,
    BookWithChaptersResponse
} from '../models/booksModels';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

export class BooksRepository {

    static async getAllBooksSimplified(): Promise<Array<{
        id: string;
        title: string;
        coverImage: string | null;
        genre: string;
    }>> {
        try {
            const books = await prisma.book.findMany({
                where: {
                    published: true, // Solo libros publicados
                },
                select: {
                    id: true,
                    title: true,
                    coverImage: true,
                    genres: {
                        include: {
                            genre: {
                                select: {
                                    name: true
                                }
                            }
                        },
                        take: 1 // Solo tomar el primer género
                    }
                },
                orderBy: {
                    createdAt: 'desc' // Los más recientes primero
                }
            });

            const simplifiedBooks = books.map(book => ({
                id: book.id.toString(),
                title: book.title,
                coverImage: book.coverImage,
                genre: book.genres.length > 0 ? book.genres[0].genre.name : 'Sin género'
            }));

            return serializeBigInt(simplifiedBooks);
        } catch (error) {
            console.error('Error en getAllBooksSimplified:', error);
            throw new Error('Error al obtener los libros simplificados');
        }
    }

    static async createBook(bookData: CreateBookType & { genreIds: number[] }): Promise<BookResponse> {
        try {
            const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                // Crear el libro
                const book = await tx.book.create({
                    data: {
                        title: bookData.title,
                        description: bookData.description,
                        authorId: BigInt(bookData.authorId),
                        coverImage: bookData.coverImage,
                        published: false
                    },
                    include: {
                        author: {
                            select: {
                                username: true,
                                profilePicture: true
                            }
                        }
                    }
                });

                // Asociar géneros al libro
                if (bookData.genreIds.length > 0) {
                    await tx.bookGenre.createMany({
                        data: bookData.genreIds.map(genreId => ({
                            bookId: book.id,
                            genreId: BigInt(genreId)
                        }))
                    });
                }

                // Obtener el libro con los géneros
                const bookWithGenres = await tx.book.findUnique({
                    where: { id: book.id },
                    include: {
                        author: {
                            select: {
                                username: true,
                                profilePicture: true
                            }
                        },
                        genres: {
                            include: {
                                genre: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                });

                return {
                    id: bookWithGenres!.id.toString(),
                    title: bookWithGenres!.title,
                    description: bookWithGenres!.description,
                    coverImage: bookWithGenres!.coverImage,
                    published: bookWithGenres!.published,
                    createdAt: bookWithGenres!.createdAt,
                    authorId: bookWithGenres!.authorId?.toString() || '',
                    author: bookWithGenres!.author!,
                    genres: bookWithGenres!.genres.map((bg: any) => ({
                        id: bg.genre.id.toString(),
                        name: bg.genre.name
                    }))
                };
            });

            return serializeBigInt(result);
        } catch (error) {
            console.error('Error en BooksRepository.createBook:', error);
            throw error;
        }
    }

    static async getBookWithChapters(bookId: number, userId: number): Promise<BookWithChaptersResponse | null> {
        try {
            // Primero obtenemos el libro para verificar si el usuario es el autor
            const book = await prisma.book.findUnique({
                where: { id: BigInt(bookId) },
                select: {
                    authorId: true
                }
            });

            if (!book) return null;

            const isAuthor = book.authorId?.toString() === userId.toString();

            // Ahora hacemos la consulta completa con la condición de capítulos según si es autor o no
            const fullBook = await prisma.book.findUnique({
                where: { id: BigInt(bookId) },
                include: {
                    author: {
                        select: {
                            username: true,
                            profilePicture: true
                        }
                    },
                    genres: {
                        include: {
                            genre: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    },
                    chapters: {
                        where: isAuthor ? undefined : { published: true },
                        select: {
                            id: true,
                            title: true,
                            published: true,
                            createdAt: true,
                            likes: {
                                where: { userId: BigInt(userId) },
                                select: { userId: true }
                            }
                        },
                        orderBy: { createdAt: 'asc' }
                    },
                    comments: {
                        include: {
                            user: {
                                select: {
                                    username: true,
                                    profilePicture: true
                                }
                            }
                        },
                        orderBy: { createdAt: 'desc' }
                    }
                }
            });

            if (!fullBook) return null;

            const result = {
                id: fullBook.id.toString(),
                title: fullBook.title,
                description: fullBook.description,
                coverImage: fullBook.coverImage,
                published: fullBook.published,
                createdAt: fullBook.createdAt,
                authorId: fullBook.authorId?.toString() || '',
                author: fullBook.author!,
                genres: fullBook.genres.map((bg: any) => ({
                    id: bg.genre.id.toString(),
                    name: bg.genre.name
                })),
                chapters: fullBook.chapters.map((chapter: any) => ({
                    id: chapter.id.toString(),
                    title: chapter.title,
                    published: chapter.published,
                    createdAt: chapter.createdAt,
                    isLiked: chapter.likes.length > 0
                })),
                comments: fullBook.comments.map((comment: any) => ({
                    id: comment.id.toString(),
                    comment: comment.comment,
                    createdAt: comment.createdAt,
                    user: comment.user
                }))
            };

            return serializeBigInt(result);
        } catch (error) {
            console.error('Error en BooksRepository.getBookWithChapters:', error);
            throw error;
        }
    }

    static async updateBook(bookId: number, updateData: UpdateBookType & { genreIds?: number[] }): Promise<BookResponse | null> {
        try {
            const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                // Actualizar información básica del libro
                const updatedBook = await tx.book.update({
                    where: { id: BigInt(bookId) },
                    data: {
                        ...(updateData.title && { title: updateData.title }),
                        ...(updateData.description && { description: updateData.description }),
                        ...(updateData.coverImage && { coverImage: updateData.coverImage })
                    },
                    include: {
                        author: {
                            select: {
                                username: true,
                                profilePicture: true
                            }
                        }
                    }
                });

                // Actualizar géneros si se proporcionaron
                if (updateData.genreIds && updateData.genreIds.length > 0) {
                    // Eliminar asociaciones existentes
                    await tx.bookGenre.deleteMany({
                        where: { bookId: BigInt(bookId) }
                    });

                    // Crear nuevas asociaciones
                    await tx.bookGenre.createMany({
                        data: updateData.genreIds.map(genreId => ({
                            bookId: BigInt(bookId),
                            genreId: BigInt(genreId)
                        }))
                    });
                }

                // Obtener el libro actualizado con géneros
                const bookWithGenres = await tx.book.findUnique({
                    where: { id: BigInt(bookId) },
                    include: {
                        author: {
                            select: {
                                username: true,
                                profilePicture: true
                            }
                        },
                        genres: {
                            include: {
                                genre: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                });

                return {
                    id: bookWithGenres!.id.toString(),
                    title: bookWithGenres!.title,
                    description: bookWithGenres!.description,
                    coverImage: bookWithGenres!.coverImage,
                    published: bookWithGenres!.published,
                    createdAt: bookWithGenres!.createdAt,
                    authorId: bookWithGenres!.authorId?.toString() || '',
                    author: bookWithGenres!.author!,
                    genres: bookWithGenres!.genres.map((bg: any) => ({
                        id: bg.genre.id.toString(),
                        name: bg.genre.name
                    }))
                };
            });

            return serializeBigInt(result);
        } catch (error) {
            console.error('Error en BooksRepository.updateBook:', error);
            throw error;
        }
    }

    static async togglePublishStatus(bookId: number, published: boolean): Promise<BookResponse | null> {
        try {
            const book = await prisma.book.update({
                where: { id: BigInt(bookId) },
                data: { published },
                include: {
                    author: {
                        select: {
                            username: true,
                            profilePicture: true
                        }
                    },
                    genres: {
                        include: {
                            genre: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                }
            });

            const result = {
                id: book.id.toString(),
                title: book.title,
                description: book.description,
                coverImage: book.coverImage,
                published: book.published,
                createdAt: book.createdAt,
                authorId: book.authorId?.toString() || '',
                author: book.author!,
                genres: book.genres.map((bg: any) => ({
                    id: bg.genre.id.toString(),
                    name: bg.genre.name
                }))
            };

            return serializeBigInt(result);
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
                return null;
            }
            console.error('Error en BooksRepository.togglePublishStatus:', error);
            throw error;
        }
    }

    static async deleteBook(bookId: number): Promise<boolean> {
        try {
            await prisma.book.delete({
                where: { id: BigInt(bookId) }
            });
            return true;
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
                return false;
            }
            console.error('Error en BooksRepository.deleteBook:', error);
            throw error;
        }
    }

    static async getUserFavoriteBooks(userId: number): Promise<BookResponse[]> {
        try {
            const favoriteBooks = await prisma.bookLike.findMany({
                where: { userId: BigInt(userId) },
                include: {
                    book: {
                        include: {
                            author: {
                                select: {
                                    username: true,
                                    profilePicture: true
                                }
                            },
                            genres: {
                                include: {
                                    genre: {
                                        select: {
                                            id: true,
                                            name: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            const result = favoriteBooks.map(fav => ({
                id: fav.book.id.toString(),
                title: fav.book.title,
                description: fav.book.description,
                coverImage: fav.book.coverImage,
                published: fav.book.published,
                createdAt: fav.book.createdAt,
                authorId: fav.book.authorId?.toString() || '',
                author: fav.book.author!,
                genres: fav.book.genres.map((bg: any) => ({
                    id: bg.genre.id.toString(),
                    name: bg.genre.name
                }))
            }));

            return serializeBigInt(result);
        } catch (error) {
            console.error('Error en BooksRepository.getUserFavoriteBooks:', error);
            throw error;
        }
    }

    static async getUserWritingBooks(userId: number): Promise<BookResponse[]> {
        try {
            const writingBooks = await prisma.book.findMany({
                where: { authorId: BigInt(userId) },
                include: {
                    author: {
                        select: {
                            username: true,
                            profilePicture: true
                        }
                    },
                    genres: {
                        include: {
                            genre: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            const result = writingBooks.map(book => ({
                id: book.id.toString(),
                title: book.title,
                description: book.description,
                coverImage: book.coverImage,
                published: book.published,
                createdAt: book.createdAt,
                authorId: book.authorId?.toString() || '',
                author: book.author!,
                genres: book.genres.map((bg: any) => ({
                    id: bg.genre.id.toString(),
                    name: bg.genre.name
                }))
            }));

            return serializeBigInt(result);
        } catch (error) {
            console.error('Error en BooksRepository.getUserWritingBooks:', error);
            throw error;
        }
    }

    // Buscar libros por texto similar en título o descripción
    static async searchBooksByText(query: string, userId?: number): Promise<Array<{
        id: string;
        title: string;
        description: string | null;
        coverImage: string | null;
        genres: Array<{ id: string; name: string }>;
        isFav: boolean;
    }>> {
        try {
            const books = await prisma.book.findMany({
                where: {
                    published: true,
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                        {
                            genres: {
                                some: {
                                    genre: {
                                        name: { contains: query, mode: 'insensitive' }
                                    }
                                }
                            }
                        }
                    ]
                },
                include: {
                    genres: {
                        include: {
                            genre: true
                        }
                    },
                    likes: userId ? {
                        where: { userId: BigInt(userId) },
                        select: { userId: true }
                    } : false
                },
                orderBy: { createdAt: 'desc' }
            });

            return books.map(book => ({
                id: book.id.toString(),
                title: book.title,
                description: book.description,
                coverImage: book.coverImage,
                genres: book.genres.map(bg => ({
                    id: bg.genre.id.toString(),
                    name: bg.genre.name
                })),
                isFav: userId ? (book.likes && book.likes.length > 0) : false
            }));
        } catch (error) {
            console.error('Error en searchBooksByText:', error);
            throw new Error('Error al buscar libros');
        }
    }

    // Métodos auxiliares
    static async userExists(userId: number): Promise<boolean> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: BigInt(userId) },
                select: { id: true }
            });
            return !!user;
        } catch (error) {
            console.error('Error en BooksRepository.userExists:', error);
            return false;
        }
    }

    static async bookExists(bookId: number): Promise<{ exists: boolean, authorId?: string, title?: string }> {
        try {
            const book = await prisma.book.findUnique({
                where: { id: BigInt(bookId) },
                select: { id: true, authorId: true, title: true }
            });
            return { exists: !!book, authorId: book?.authorId?.toString(), title: book?.title };
        } catch (error) {
            console.error('Error en BooksRepository.bookExists:', error);
            return { exists: false };
        }
    }
}