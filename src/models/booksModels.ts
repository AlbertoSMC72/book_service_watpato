import { z } from 'zod';

// ===== SCHEMAS DE LIBROS =====

export const createBookSchema = z.object({
    title: z.string()
        .min(3, 'El título debe tener al menos 3 caracteres')
        .max(255, 'El título no puede tener más de 255 caracteres'),
    description: z.string()
        .min(10, 'La descripción debe tener al menos 10 caracteres')
        .max(1000, 'La descripción no puede tener más de 1000 caracteres'),
    authorId: z.number()
        .int('El ID del autor debe ser un número entero')
        .positive('El ID del autor debe ser positivo'),
    genreIds: z.array(z.number().int().positive()).optional(),
    newGenres: z.array(z.string().min(2).max(50)).optional(),
    coverImage: z.string().url('Debe ser una URL válida').optional()
});

export const updateBookSchema = z.object({
    title: z.string()
        .min(3, 'El título debe tener al menos 3 caracteres')
        .max(255, 'El título no puede tener más de 255 caracteres')
        .optional(),
    description: z.string()
        .min(10, 'La descripción debe tener al menos 10 caracteres')
        .max(1000, 'La descripción no puede tener más de 1000 caracteres')
        .optional(),
    genreIds: z.array(z.number().int().positive()).optional(),
    newGenres: z.array(z.string().min(2).max(50)).optional(),
    coverImage: z.string().url('Debe ser una URL válida').optional()
});

export const publishBookSchema = z.object({
    published: z.boolean()
});

// ===== SCHEMAS DE CAPÍTULOS =====

export const createChapterSchema = z.object({
    title: z.string()
        .min(3, 'El título del capítulo debe tener al menos 3 caracteres')
        .max(255, 'El título del capítulo no puede tener más de 255 caracteres')
});

export const addChapterContentSchema = z.object({
    paragraphs: z.array(
        z.string().min(10, 'Cada párrafo debe tener al menos 10 caracteres')
    ).min(1, 'Debe incluir al menos un párrafo')
});

export const publishChapterSchema = z.object({
    published: z.boolean()
});

// ===== SCHEMAS DE COMENTARIOS =====

export const createBookCommentSchema = z.object({
    userId: z.number()
        .int('El ID del usuario debe ser un número entero')
        .positive('El ID del usuario debe ser positivo'),
    comment: z.string()
        .min(3, 'El comentario debe tener al menos 3 caracteres')
        .max(1000, 'El comentario no puede tener más de 1000 caracteres')
});

export const createChapterCommentSchema = z.object({
    userId: z.number()
        .int('El ID del usuario debe ser un número entero')
        .positive('El ID del usuario debe ser positivo'),
    comment: z.string()
        .min(3, 'El comentario debe tener al menos 3 caracteres')
        .max(1000, 'El comentario no puede tener más de 1000 caracteres')
});

// ===== TIPOS TYPESCRIPT =====

export type CreateBookType = z.infer<typeof createBookSchema>;
export type UpdateBookType = z.infer<typeof updateBookSchema>;
export type PublishBookType = z.infer<typeof publishBookSchema>;

export type CreateChapterType = z.infer<typeof createChapterSchema>;
export type AddChapterContentType = z.infer<typeof addChapterContentSchema>;
export type PublishChapterType = z.infer<typeof publishChapterSchema>;

export type CreateBookCommentType = z.infer<typeof createBookCommentSchema>;
export type CreateChapterCommentType = z.infer<typeof createChapterCommentSchema>;

// ===== INTERFACES DE RESPUESTA =====

export interface BookResponse {
    id: string;
    title: string;
    description: string | null;
    coverImage: string | null;
    published: boolean;
    createdAt: Date;
    authorId: string;
    author: {
        username: string;
        profilePicture: string | null;
    };
    genres: Array<{
        id: string;
        name: string;
    }>;
}

export interface BookWithChaptersResponse extends BookResponse {
    chapters: Array<{
        id: string;
        title: string;
        published: boolean;
        createdAt: Date;
        isLiked: boolean; // Si el usuario que consulta le dio like
    }>;
    comments: Array<{
        id: string;
        comment: string;
        createdAt: Date;
        user: {
            username: string;
            profilePicture: string | null;
        };
    }>;
}

export interface ChapterResponse {
    id: string;
    title: string;
    published: boolean;
    createdAt: Date;
    bookId: string;
    book: {
        title: string;
        author: {
            username: string;
        };
    };
}

export interface ChapterWithContentResponse extends ChapterResponse {
    paragraphs: Array<{
        id: string;
        paragraphNumber: number;
        content: string;
    }>;
    comments: Array<{
        id: string;
        comment: string;
        createdAt: Date;
        user: {
            username: string;
            profilePicture: string | null;
        };
    }>;
}

export interface CommentResponse {
    id: string;
    comment: string;
    createdAt: Date;
    userId: string;
    user: {
        username: string;
        profilePicture: string | null;
    };
}

export interface GenreUsageResponse {
    id: string;
    name: string;
    usage_count: number;
    percentage: number;
}

export interface UserBooksResponse {
    favorites: BookResponse[];
    writing: BookResponse[];
}