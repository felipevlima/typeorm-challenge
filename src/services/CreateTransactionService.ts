import { getRepository, getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);

    let categoryExists = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryExists) {
      categoryExists = categoryRepository.create({ title: category });

      await categoryRepository.save(categoryExists);
    }

    const transactionBalance = getCustomRepository(TransactionsRepository);

    const balance = await transactionBalance.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError('Outcome is higher than the total balance!');
    }

    const transactionRepository = getRepository(Transaction);

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category_id: categoryExists.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
