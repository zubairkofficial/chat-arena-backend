import { DataSource, Repository } from "typeorm";
import { FigureRole } from "./entities/figure-role.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class FigureRoleRepository extends Repository<FigureRole> {
  constructor(private readonly dataSource: DataSource) {
    super(FigureRole, dataSource.createEntityManager());
  }
}