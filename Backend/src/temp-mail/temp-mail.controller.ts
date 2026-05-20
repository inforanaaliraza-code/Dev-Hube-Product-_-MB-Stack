import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CreateMailboxDto } from './dto/create-mailbox.dto';
import { TempMailService } from './services/temp-mail.service';

@Controller('temp-mail')
export class TempMailController {
  constructor(private readonly tempMail: TempMailService) {}

  @Get('health')
  health() {
    return this.tempMail.workerHealth();
  }

  @Get('domains')
  domains() {
    return this.tempMail.getDomains();
  }

  @Post('mailboxes')
  createMailbox(@Body() body: CreateMailboxDto) {
    return this.tempMail.createMailbox(body);
  }

  @Get('mailboxes/:id')
  getMailbox(@Param('id', ParseUUIDPipe) id: string) {
    return this.tempMail.getMailbox(id);
  }

  @Delete('mailboxes/:id')
  deleteMailbox(@Param('id', ParseUUIDPipe) id: string) {
    return this.tempMail.deleteMailbox(id);
  }

  @Get('mailboxes/:id/messages')
  listMessages(@Param('id', ParseUUIDPipe) id: string) {
    return this.tempMail.listMessages(id);
  }

  @Get('mailboxes/:id/messages/:messageId')
  getMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('messageId') messageId: string,
  ) {
    return this.tempMail.getMessage(id, messageId);
  }
}
