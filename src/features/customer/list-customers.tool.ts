import { CallToolResult } from '@modelcontextprotocol/sdk/types';

import { fetchCustomersList } from './customer.api';

import { BaseTool } from '@/shared/tool/tool.module';

export class ListCustomersTool extends BaseTool {
  config = {
    name: 'list-customers',
    title: 'List Customers',
    description: 'this tool will list customers',
    inputSchema: {},
  };

  async execute(): Promise<CallToolResult> {
    const response = await fetchCustomersList();

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
