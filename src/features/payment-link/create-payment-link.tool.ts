import { BaseTool } from '@/shared/tool/base-tool';
import { CallToolResult } from '@modelcontextprotocol/sdk/types';

import { createPaymentLinkSchema, TCreatePaymentLinkSchema } from './payment-link.validation';
import { createPaymentLink } from './payment-link.api';

export class CreatePaymentLinkTool extends BaseTool {
  protected config = {
    name: 'create-payment-link',
    title: 'Create Payment Link',
    description: 'Create a payment link',
    inputSchema: createPaymentLinkSchema,
  };

  async execute(args: TCreatePaymentLinkSchema): Promise<CallToolResult> {
    const response = await createPaymentLink(args.body);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response),
        },
      ],
    };
  }
}
