// src/repos/chaptersRepository.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { serializeBigInt } from '../utils/bigintHelper';
import {
    CreateChapterType,
    AddChapterContentType,
    ChapterResponse,
    ChapterWithContentResponse
} from '../models/booksModels';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

export class ChaptersRepository {

    static async createChapter(bookId: number, chapterData: CreateChapterType): Promise<ChapterResponse> {
        try {
            const chapter = await prisma.chapter.create({
                data: {
                    title: chapterData.title,
                    content: '', // Inicialmente vacío, se llenará con addChapterContent
                    bookId: BigInt(bookId),
                    published: false
                },
                include: {
                    book: {
                        include: {
                            author: {
                                select: {
                                    username: true
                                }
                            }
                        }
                    }
                }
            });

            const result = {
                id: chapter.id.toString(),
                title: chapter.title,
                published: chapter.published,
                createdAt: chapter.createdAt,
                bookId: chapter.bookId?.toString() || '',
                book: {
                    title: chapter.book!.title,
                    author: {
                        username: chapter.book!.author!.username
                    }
                }
            };

            return serializeBigInt(result);
        } catch (error) {
            console.error('Error en ChaptersRepository.createChapter:', error);
            throw error;
        }
    }

    static async getChapterContent(chapterId: number): Promise<ChapterWithContentResponse | null> {
        try {
            const chapter = await prisma.chapter.findUnique({
                where: { id: BigInt(chapterId) },
                include: {
                    book: {
                        include: {
                            author: {
                                select: {
                                    username: true
                                }
                            }
                        }
                    },
                    paragraphs: {
                        orderBy: { paragraphNumber: 'asc' }
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

            if (!chapter) return null;

            const result = {
                id: chapter.id.toString(),
                title: chapter.title,
                published: chapter.published,
                createdAt: chapter.createdAt,
                bookId: chapter.bookId?.toString() || '',
                book: {
                    title: chapter.book!.title,
                    author: {
                        username: chapter.book!.author!.username
                    }
                },
                paragraphs: chapter.paragraphs.map(p => ({
                    id: p.id.toString(),
                    paragraphNumber: p.paragraphNumber,
                    content: p.content
                })),
                comments: chapter.comments.map(comment => ({
                    id: comment.id.toString(),
                    comment: comment.comment,
                    createdAt: comment.createdAt,
                    user: comment.user
                }))
            };

            return serializeBigInt(result);
        } catch (error) {
            console.error('Error en ChaptersRepository.getChapterContent:', error);
            throw error;
        }
    }

    static async addChapterContent(chapterId: number, contentData: AddChapterContentType): Promise<any> {
        try {
            const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                // Obtener el número del último párrafo
                const lastParagraph = await tx.chapterParagraph.findFirst({
                    where: { chapterId: BigInt(chapterId) },
                    orderBy: { paragraphNumber: 'desc' }
                });

                const startNumber = lastParagraph ? lastParagraph.paragraphNumber + 1 : 1;

                // Crear los nuevos párrafos
                const paragraphs = await Promise.all(
                    contentData.paragraphs.map(async (content, index) => {
                        return await tx.chapterParagraph.create({
                            data: {
                                chapterId: BigInt(chapterId),
                                paragraphNumber: startNumber + index,
                                content: content
                            }
                        });
                    })
                );

                return paragraphs.map(p => ({
                    id: p.id.toString(),
                    paragraphNumber: p.paragraphNumber,
                    content: p.content
                }));
            });

            return serializeBigInt(result);
        } catch (error) {
            console.error('Error en ChaptersRepository.addChapterContent:', error);
            throw error;
        }
    }

    static async publishChapter(chapterId: number, published: boolean): Promise<ChapterResponse | null> {
        try {
            const chapter = await prisma.chapter.update({
                where: { id: BigInt(chapterId) },
                data: { published },
                include: {
                    book: {
                        include: {
                            author: {
                                select: {
                                    username: true
                                }
                            }
                        }
                    }
                }
            });

            const result = {
                id: chapter.id.toString(),
                title: chapter.title,
                published: chapter.published,
                createdAt: chapter.createdAt,
                bookId: chapter.bookId?.toString() || '',
                book: {
                    title: chapter.book!.title,
                    author: {
                        username: chapter.book!.author!.username
                    }
                }
            };

            return serializeBigInt(result);
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
                return null;
            }
            console.error('Error en ChaptersRepository.publishChapter:', error);
            throw error;
        }
    }

    static async deleteChapter(chapterId: number): Promise<boolean> {
        try {
            await prisma.chapter.delete({
                where: { id: BigInt(chapterId) }
            });
            return true;
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
                return false;
            }
            console.error('Error en ChaptersRepository.deleteChapter:', error);
            throw error;
        }
    }

    // Método auxiliar
    static async chapterExists(chapterId: number): Promise<{ exists: boolean, bookId?: string, title?: string }> {
        try {
            const chapter = await prisma.chapter.findUnique({
                where: { id: BigInt(chapterId) },
                select: { id: true, bookId: true, title: true }
            });
            return { exists: !!chapter, bookId: chapter?.bookId?.toString(), title: chapter?.title };
        } catch (error) {
            console.error('Error en ChaptersRepository.chapterExists:', error);
            return { exists: false };
        }
    }
}