/* eslint-disable @typescript-eslint/no-namespace */
import { IsInt, IsPositive, IsString } from 'class-validator';

import { OrderBy, UserTier } from './enums';
import {
  DEFAULT_PAGE_LIMIT,
  DEFAULT_PAGE_OFFSET,
  DEFAULT_FILTER_INPUT_STRING,
  DEFAULT_ORDER_BY_COLUMN,
} from './constants';

export namespace CommonDTOs {
  export class MessageResponse {
    message: string;
  }

  export class PaginationInput {
    @IsInt()
    @IsPositive()
    limit: number = DEFAULT_PAGE_LIMIT;

    @IsInt()
    offset: number = DEFAULT_PAGE_OFFSET;
  }

  export class FilterInputString {
    @IsString()
    filterInputString: string = DEFAULT_FILTER_INPUT_STRING;
  }
  export class Order {
    @IsString()
    orderByColumn: string = DEFAULT_ORDER_BY_COLUMN;

    @IsString()
    orderBy: string = OrderBy.DESC;
  }

  export class CurrentUser {
    isAdmin: boolean;
    email: string;
    id: string;
    tier:UserTier
   
  }
}
