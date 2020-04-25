import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const balance = (await this.find()).reduce(
      (accumulator: Balance, current: Transaction) => {
        switch (current.type) {
          case 'income':
            accumulator.income += Number(current.value);
            accumulator.total += Number(current.value);
            break;
          case 'outcome':
            accumulator.outcome += Number(current.value);
            accumulator.total -= Number(current.value);
            break;
          default:
            throw Error('Type is not defined');
        }

        return accumulator;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    return balance;
  }
}

export default TransactionsRepository;
