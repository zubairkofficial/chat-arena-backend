import { Injectable } from '@nestjs/common';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  public getUserByEmail(email: string): SelectQueryBuilder<User> {
    return this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .where('user.email = :email', { email });
  }
  public getUserName(username: string): SelectQueryBuilder<User> {
    return this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .where('user.username = :username', { username });
  }
  public getUserById(id: string): SelectQueryBuilder<User> {
    return this.dataSource
    .getRepository(User)
    .createQueryBuilder('user')
    .where('user.id = :id', { id });

  }
}
