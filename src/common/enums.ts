export enum RoleTypes {
  USER = 'user',
  ADMIN = 'admin',
}
export enum OrderBy {
  ASC = 'ASC',
  DESC = 'DESC',
}
export enum objectState {
  INSERT = 'insert',
  UPDATE = 'update',
  DELETE = 'delete',
  HARD_DELETE = 'hard_delete',
  BULK_INSERT = 'bulk_insert',
}

export enum JoinTypes {
  INNER_JOIN = 'INNER JOIN',
  LEFT_JOIN = 'LEFT JOIN',
}


export enum AIFigureType {
  CREATIVE = 'creative',
  ANIME = 'anime',
  FAMOUS_PEOPLE = 'famous_people',
  FICTIONAL_CHARACTER = 'fictional_character',
}

export enum ArenaRequestStatus {
  STATUS='STATUS',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}
export enum AIFigureStatus {
  IN_PROGRESS = 'IN_PROGRESS',  // Represents a figure being processed or under review
  PENDING = 'PENDING',          // Figure is pending approval or action
  APPROVED = 'APPROVED',        // Figure has been approved
  REJECTED = 'REJECTED',        // Figure has been rejected
}

export enum UserTier {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
}

export enum ModelType {
  GPT_4o_Mini= 'gpt-4o-mini',
  GPT_4o= 'gpt-4o',
  LLAMA= 'llama3',
}
