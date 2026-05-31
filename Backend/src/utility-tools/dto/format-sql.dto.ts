import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class FormatSqlDto {
  @IsString()
  @MaxLength(100000)
  sql!: string;

  @IsOptional()
  @IsIn(['sql', 'postgresql', 'mysql', 'mariadb', 'sqlite', 'transactsql', 'plsql'])
  dialect?: string;
}
