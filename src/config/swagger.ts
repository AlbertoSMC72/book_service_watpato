// src/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Books Microservice API',
            version: '1.0.0',
            description: 'API para la gestión de libros, capítulos, comentarios y géneros',
            contact: {
                name: 'Books Team',
                email: 'books@example.com',
            },
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:3000',
                description: 'Servidor de desarrollo',
            },
        ],
        components: {
            schemas: {
                Book: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        description: { type: 'string', nullable: true },
                        coverImage: { type: 'string', nullable: true },
                        published: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                        authorId: { type: 'string' },
                        author: {
                            type: 'object',
                            properties: {
                                username: { type: 'string' },
                                profilePicture: { type: 'string', nullable: true }
                            }
                        },
                        genres: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    name: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                BookWithChapters: {
                    allOf: [
                        { $ref: '#/components/schemas/Book' },
                        {
                            type: 'object',
                            properties: {
                                chapters: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'string' },
                                            title: { type: 'string' },
                                            published: { type: 'boolean' },
                                            createdAt: { type: 'string', format: 'date-time' },
                                            isLiked: { type: 'boolean' }
                                        }
                                    }
                                },
                                comments: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Comment' }
                                }
                            }
                        }
                    ]
                },
                Chapter: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        published: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                        bookId: { type: 'string' },
                        book: {
                            type: 'object',
                            properties: {
                                title: { type: 'string' },
                                author: {
                                    type: 'object',
                                    properties: {
                                        username: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                },
                ChapterWithContent: {
                    allOf: [
                        { $ref: '#/components/schemas/Chapter' },
                        {
                            type: 'object',
                            properties: {
                                paragraphs: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'string' },
                                            paragraphNumber: { type: 'integer' },
                                            content: { type: 'string' }
                                        }
                                    }
                                },
                                comments: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Comment' }
                                }
                            }
                        }
                    ]
                },
                Comment: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        comment: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        user: {
                            type: 'object',
                            properties: {
                                username: { type: 'string' },
                                profilePicture: { type: 'string', nullable: true }
                            }
                        }
                    }
                },
                Genre: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        usage_count: { type: 'integer' },
                        percentage: { type: 'number' }
                    }
                },
                CreateBookRequest: {
                    type: 'object',
                    required: ['title', 'description', 'authorId'],
                    properties: {
                        title: {
                            type: 'string',
                            minLength: 3,
                            maxLength: 255,
                            example: 'Mi Nuevo Libro'
                        },
                        description: {
                            type: 'string',
                            minLength: 10,
                            maxLength: 1000,
                            example: 'Una descripción fascinante del libro'
                        },
                        authorId: {
                            type: 'integer',
                            minimum: 1,
                            example: 1
                        },
                        genreIds: {
                            type: 'array',
                            items: { type: 'integer', minimum: 1 },
                            example: [1, 2, 3]
                        },
                        newGenres: {
                            type: 'array',
                            items: { type: 'string', minLength: 2, maxLength: 50 },
                            example: ['Nuevo Género', 'Otro Género']
                        },
                        coverImage: {
                            type: 'string',
                            format: 'uri',
                            example: 'https://example.com/cover.jpg'
                        }
                    }
                },
                CreateChapterRequest: {
                    type: 'object',
                    required: ['title'],
                    properties: {
                        title: {
                            type: 'string',
                            minLength: 3,
                            maxLength: 255,
                            example: 'Capítulo 1: El Comienzo'
                        }
                    }
                },
                AddContentRequest: {
                    type: 'object',
                    required: ['paragraphs'],
                    properties: {
                        paragraphs: {
                            type: 'array',
                            items: { type: 'string', minLength: 10 },
                            minItems: 1,
                            example: [
                                'Este es el primer párrafo del capítulo.',
                                'Y este es el segundo párrafo con más contenido.'
                            ]
                        }
                    }
                },
                CreateCommentRequest: {
                    type: 'object',
                    required: ['userId', 'comment'],
                    properties: {
                        userId: {
                            type: 'integer',
                            minimum: 1,
                            example: 1
                        },
                        comment: {
                            type: 'string',
                            minLength: 3,
                            maxLength: 1000,
                            example: 'Este es un comentario muy interesante'
                        }
                    }
                },
                PublishRequest: {
                    type: 'object',
                    required: ['published'],
                    properties: {
                        published: {
                            type: 'boolean',
                            example: true
                        }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Error message' },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    field: { type: 'string' },
                                    message: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Operation successful' },
                        data: { type: 'object' }
                    }
                }
            },
            responses: {
                400: {
                    description: 'Datos inválidos',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' }
                        }
                    }
                },
                404: {
                    description: 'Recurso no encontrado',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' }
                        }
                    }
                },
                500: {
                    description: 'Error interno del servidor',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' }
                        }
                    }
                }
            }
        },
        tags: [
            {
                name: 'Books',
                description: 'Operaciones relacionadas con libros'
            },
            {
                name: 'Chapters',
                description: 'Operaciones relacionadas con capítulos'
            },
            {
                name: 'Comments',
                description: 'Operaciones relacionadas con comentarios'
            },
            {
                name: 'Genres',
                description: 'Operaciones relacionadas con géneros'
            }
        ]
    },
    apis: ['./src/routes/*.ts'], // Rutas donde están los comentarios de Swagger
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Books API Documentation'
    }));
}