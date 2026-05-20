export class TempMailboxResponseDto {
  id!: string;
  address!: string;
  expiresAt!: string;
  createdAt!: string;
}

export class TempMessageSummaryDto {
  id!: string;
  from!: string;
  subject!: string;
  intro!: string;
  receivedAt!: string;
  hasAttachments!: boolean;
  otpCode!: string | null;
}

export class TempMessageDetailDto extends TempMessageSummaryDto {
  text!: string;
  html!: string;
  sanitizedHtml!: string;
  otpCodes!: string[];
}

export class TempDomainDto {
  domain!: string;
}
