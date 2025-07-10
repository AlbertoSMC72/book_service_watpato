// src/repos/commentsRepository.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { serializeBigInt } from '../utils/bigintHelper';
import {
    CreateBookCommentType,
    CreateChapterCommentType,
    CommentResponse
} from '../models/booksModels';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

export class CommentsRepository {

    static async createBookComment(bookId: number, commentData: CreateBookCommentType): Promise<CommentResponse> {
        try {
            const comment = await prisma.bookComment.create({
                data: {
                    userId: BigInt(commentData.userId),
                    bookId: BigInt(bookId),
                    comment: commentData.comment
                },
                include: {
                    user: {
                        select: {
                            username: true,
                            profilePicture: true
                        }
                    }
                }
            });

            const result = {
                id: comment.id.toString(),
                comment: comment.comment,
                createdAt: comment.createdAt,
                userId: comment.userId.toString(),
                user: comment.user
            };

            return serializeBigInt(result);
        } catch (error) {
            console.error('Error en CommentsRepository.createBookComment:', error);
            throw error;
        }
    }

    static async createChapterComment(chapterId: number, commentData: CreateChapterCommentType): Promise<CommentResponse> {
        try {
            const comment = await prisma.chapterComment.create({
                data: {
                    userId: BigInt(commentData.userId),
                    chapterId: BigInt(chapterId),
                    comment: commentData.comment
                },
                include: {
                    user: {
                        select: {
                            username: true,
                            profilePicture: true
                        }
                    }
                }
            });

            const result = {
                id: comment.id.toString(),
                comment: comment.comment,
                createdAt: comment.createdAt,
                userId: comment.userId.toString(),
                user: comment.user
            };

            return serializeBigInt(result);
        } catch (error) {
            console.error('Error en CommentsRepository.createChapterComment:', error);
            throw error;
        }
    }

    static async deleteBookComment(commentId: number): Promise<boolean> {
        try {
            await prisma.bookComment.delete({
                where: { id: BigInt(commentId) }
            });
            return true;
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
                return false;
            }
            console.error('Error en CommentsRepository.deleteBookComment:', error);
            throw error;
        }
    }

    static async deleteChapterComment(commentId: number): Promise<boolean> {
        try {
            await prisma.chapterComment.delete({
                where: { id: BigInt(commentId) }
            });
            return true;
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
                return false;
            }
            console.error('Error en CommentsRepository.deleteChapterComment:', error);
            throw error;
        }
    }
}