const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Analytics Service API',
      version: '1.0.0',
      description: 'Микросервис для аналитики продаж цветочного магазина',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./index.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Моковые данные для аналитики
let salesData = [
  { id: 1, product: 'Розы', quantity: 15, amount: 7500, date: '2024-01-15' },
  { id: 2, product: 'Тюльпаны', quantity: 25, amount: 5000, date: '2024-01-16' }
];

/**
 * @swagger
 * components:
 *   schemas:
 *     Sale:
 *       type: object
 *       required:
 *         - product
 *         - quantity
 *         - amount
 *       properties:
 *         id:
 *           type: integer
 *           description: ID продажи
 *         product:
 *           type: string
 *           description: Название продукта
 *         quantity:
 *           type: integer
 *           description: Количество
 *         amount:
 *           type: number
 *           description: Сумма продажи
 *         date:
 *           type: string
 *           format: date
 *           description: Дата продажи
 *     SalesStats:
 *       type: object
 *       properties:
 *         totalSales:
 *           type: number
 *           description: Общая сумма продаж
 *         totalQuantity:
 *           type: integer
 *           description: Общее количество проданных товаров
 *         averageSale:
 *           type: number
 *           description: Средний чек
 *         salesCount:
 *           type: integer
 *           description: Количество продаж
 *         salesData:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Sale'
 */

/**
 * @swagger
 * /analytics/sales:
 *   get:
 *     summary: Получить статистику продаж
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Статистика продаж
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SalesStats'
 */
app.get('/analytics/sales', (req, res) => {
  const totalSales = salesData.reduce((sum, sale) => sum + sale.amount, 0);
  const totalQuantity = salesData.reduce((sum, sale) => sum + sale.quantity, 0);
  
  res.json({
    totalSales,
    totalQuantity,
    averageSale: totalSales / salesData.length,
    salesCount: salesData.length,
    salesData
  });
});

/**
 * @swagger
 * /analytics/sales:
 *   post:
 *     summary: Добавить новую продажу
 *     tags: [Analytics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product
 *               - quantity
 *               - amount
 *             properties:
 *               product:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Продажа добавлена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 */
app.post('/analytics/sales', (req, res) => {
  const { product, quantity, amount } = req.body;
  const newSale = {
    id: salesData.length + 1,
    product,
    quantity,
    amount,
    date: new Date().toISOString().split('T')[0]
  };
  salesData.push(newSale);
  res.status(201).json(newSale);
});

/**
 * @swagger
 * /analytics/products:
 *   get:
 *     summary: Получить отчет по продуктам
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Статистика по продуктам
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: object
 *                 properties:
 *                   totalQuantity:
 *                     type: integer
 *                   totalAmount:
 *                     type: number
 */
app.get('/analytics/products', (req, res) => {
  const productStats = salesData.reduce((acc, sale) => {
    if (!acc[sale.product]) {
      acc[sale.product] = { totalQuantity: 0, totalAmount: 0 };
    }
    acc[sale.product].totalQuantity += sale.quantity;
    acc[sale.product].totalAmount += sale.amount;
    return acc;
  }, {});
  
  res.json(productStats);
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
 */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Analytics Service' });
});

app.listen(PORT, () => {
  console.log(`Analytics Service running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});