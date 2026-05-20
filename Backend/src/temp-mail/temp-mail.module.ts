import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TempMailboxEntity } from './entities/temp-mailbox.entity';
import { MailTmProvider } from './providers/mail-tm.provider';
import { MailWorkerClient } from './services/mail-worker.client';
import { TempMailService } from './services/temp-mail.service';
import { TempMailController } from './temp-mail.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TempMailboxEntity])],
  controllers: [TempMailController],
  providers: [TempMailService, MailTmProvider, MailWorkerClient],
  exports: [TempMailService],
})
export class TempMailModule {}
