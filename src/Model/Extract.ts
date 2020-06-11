import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Extract {
	@PrimaryGeneratedColumn()
	Id!: number;

	@Column('int')
	timestamp!: number;

	@Column('text')
	selectedCode!: string;

	@Column('text')
	comment!: string;

	@Column('float')
	priority!: number;

	@Column('boolean')
	exported!: boolean;

	@Column('text')
	file!: string;

	@Column('text')
	language!: string;

	@Column('text')
	project!: string;
}
