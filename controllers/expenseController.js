const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const toPaise = (amount) => {
  const parsed = Number(amount);
  if (!Number.isFinite(parsed)) return NaN;
  return Math.round(parsed * 100);
};

const createExpense = asyncHandler(async (request, response) => {
  const { amount, ...data } = request.body;
  const expense = await Expense.create({ ...data, amountPaise: toPaise(amount), userId: request.user.id });
  response.status(201).json({ success: true, message: 'Expense created successfully', data: expense });
});

const getExpenses = asyncHandler(async (request, response) => {
  const { category, paymentMethod, startDate, endDate } = request.query;
  const page = Math.max(Number.parseInt(request.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(request.query.limit, 10) || 10, 1), 100);
  const filter = { userId: request.user.id };
  if (category) filter.category = category;
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = parseDate(startDate, 'startDate');
    if (endDate) {
      const parsedEndDate = parseDate(endDate, 'endDate');
      parsedEndDate.setHours(23, 59, 59, 999);
      filter.date.$lte = parsedEndDate;
    }
  }
  const allowedSortFields = ['date', 'amountPaise', 'title', 'category', 'createdAt'];
  const requestedSort = request.query.sort || '-date';
  const sortField = requestedSort.replace(/^-/, '');
  const sort = allowedSortFields.includes(sortField) ? requestedSort : '-date';
  const skip = (page - 1) * limit;
  const [expenses, totalItems] = await Promise.all([
    Expense.find(filter).sort(sort).skip(skip).limit(limit),
    Expense.countDocuments(filter)
  ]);
  response.json({ success: true, message: 'Expenses retrieved successfully', data: { expenses, pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) } } });
});

const getExpenseById = asyncHandler(async (request, response) => {
  const expense = await Expense.findOne({ _id: request.params.id, userId: request.user.id });
  if (!expense) throw new AppError('Expense not found', 404);
  response.json({ success: true, message: 'Expense retrieved successfully', data: expense });
});

const updateExpense = asyncHandler(async (request, response) => {
  const update = { ...request.body };
  if (update.amount !== undefined) {
    update.amountPaise = toPaise(update.amount);
    delete update.amount;
  }
  const expense = await Expense.findOneAndUpdate({ _id: request.params.id, userId: request.user.id }, update, { new: true, runValidators: true });
  if (!expense) throw new AppError('Expense not found', 404);
  response.json({ success: true, message: 'Expense updated successfully', data: expense });
});

const deleteExpense = asyncHandler(async (request, response) => {
  const expense = await Expense.findOneAndDelete({ _id: request.params.id, userId: request.user.id });
  if (!expense) throw new AppError('Expense not found', 404);
  response.json({ success: true, message: 'Expense deleted successfully', data: expense });
});

const getSummary = asyncHandler(async (request, response) => {
  const month = Number.parseInt(request.query.month, 10);
  const year = Number.parseInt(request.query.year, 10);
  if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year) || year < 1970) {
    throw new AppError('month must be 1-12 and year must be a valid four-digit year', 400);
  }
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 1));
  const breakdown = await Expense.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(request.user.id), date: { $gte: startDate, $lt: endDate } } },
    { $group: { _id: '$category', totalPaise: { $sum: '$amountPaise' }, count: { $sum: 1 } } },
    { $sort: { totalPaise: -1 } }
  ]);
  const totalSpent = breakdown.reduce((sum, item) => sum + item.totalPaise, 0) / 100;
  response.json({ success: true, message: 'Expense summary retrieved successfully', data: { month, year, totalSpent, expenseCount: breakdown.reduce((sum, item) => sum + item.count, 0), breakdown: breakdown.map((item) => ({ category: item._id, total: item.totalPaise / 100, count: item.count })) } });
});

const parseDate = (value, fieldName) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new AppError(`${fieldName} must be a valid date`, 400);
  return date;
};

const isValidObjectId = (request, response, next) => {
  if (!mongoose.isValidObjectId(request.params.id)) return next(new AppError('Invalid expense id', 400));
  next();
};

module.exports = { createExpense, getExpenses, getExpenseById, updateExpense, deleteExpense, getSummary, isValidObjectId };
