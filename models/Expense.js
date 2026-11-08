const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    amountPaise: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be greater than 0'],
      validate: { validator: Number.isInteger, message: 'Amount must be stored as whole paise' }
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [40, 'Category cannot exceed 40 characters']
    },
    paymentMethod: {
      type: String,
      trim: true,
      maxlength: [40, 'Payment method cannot exceed 40 characters'],
      default: 'UPI'
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

expenseSchema.virtual('amount').get(function getAmount() {
  return this.amountPaise / 100;
});

expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ paymentMethod: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
