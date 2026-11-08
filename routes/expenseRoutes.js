const express = require('express');
const { body } = require('express-validator');
const {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getSummary,
  isValidObjectId
} = require('../controllers/expenseController');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);
const categories = ['Food', 'Groceries', 'Rent', 'Utilities', 'Bills', 'Dining', 'Travel', 'Entertainment', 'Health', 'Shopping', 'Education', 'Subscriptions', 'Other'];
const paymentMethods = ['UPI', 'Cash', 'Debit Card', 'Credit Card', 'Net Banking', 'Online Payment', 'Wallet', 'Cheque', 'Bank Transfer', 'Other'];

const expenseValidation = [
  body('title').trim().isLength({ min: 2, max: 100 }).withMessage('Title must be between 2 and 100 characters'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('category').trim().isLength({ min: 1, max: 40 }).withMessage('Category must be between 1 and 40 characters'),
  body('paymentMethod').optional().trim().isLength({ min: 1, max: 40 }).withMessage('Payment method must be between 1 and 40 characters'),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO date'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
];

const fullExpenseValidation = [
  ...expenseValidation,
  body('title').exists().withMessage('Title is required'),
  body('amount').exists().withMessage('Amount is required'),
  body('category').exists().withMessage('Category is required')
];

const partialExpenseValidation = [
  body('title').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Title must be between 2 and 100 characters'),
  body('amount').optional().isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('category').optional().trim().isLength({ min: 1, max: 40 }).withMessage('Category must be between 1 and 40 characters'),
  body('paymentMethod').optional().trim().isLength({ min: 1, max: 40 }).withMessage('Payment method must be between 1 and 40 characters'),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO date'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
];

router.get('/summary', getSummary);
router.get('/', getExpenses);
router.post('/', expenseValidation, validate, createExpense);
router.get('/:id', isValidObjectId, getExpenseById);
router.put('/:id', isValidObjectId, fullExpenseValidation, validate, updateExpense);
router.patch('/:id', isValidObjectId, partialExpenseValidation, validate, updateExpense);
router.delete('/:id', isValidObjectId, deleteExpense);

module.exports = router;
