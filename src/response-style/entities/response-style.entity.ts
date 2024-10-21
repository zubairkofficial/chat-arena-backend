import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ResponseStyle {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column()
  style: string; // e.g., 'formal', 'sarcastic', 'supportive'
}
