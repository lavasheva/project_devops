const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Notification Service API',
      version: '1.0.0',
      description: 'Микросервис для управления уведомлениями цветочного магазина',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./index.js'], // files containing annotations
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Моковые данные для уведомлений
let notifications = [
  {
    id: 1,
    message: 'Новая поставка роз',
    type: 'supply',
    timestamp: '2024-01-15T10:30:00.000Z'
  }
];

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - message
 *         - type
 *       properties:
 *         id:
 *           type: integer
 *           description: ID уведомления
 *         message:
 *           type: string
 *           description: Текст уведомления
 *         type:
 *           type: string
 *           description: Тип уведомления
 *           enum: [sale, supply, system, alert]
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Время создания
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Получить все уведомления
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Список уведомлений
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 */
app.get('/notifications', (req, res) => {
  res.json(notifications);
});

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Создать новое уведомление
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - type
 *             properties:
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [sale, supply, system, alert]
 *     responses:
 *       201:
 *         description: Уведомление создано
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 */
app.post('/notifications', (req, res) => {
  const { message, type } = req.body;
  const newNotification = {
    id: notifications.length + 1,
    message,
    type,
    timestamp: new Date().toISOString()
  };
  notifications.push(newNotification);
  res.status(201).json(newNotification);
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Проверка здоровья сервиса
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Сервис работает
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 service:
 *                   type: string
 */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Notification Service' });
});

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});