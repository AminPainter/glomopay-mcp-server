import { CallToolResult } from "@modelcontextprotocol/sdk/types";

import { fetchCustomersList } from "./customer.api";

import { BaseTool } from "@/shared/tool/tool.module";

export class ListCustomersTool extends BaseTool {
  config = {
    name: "list-customers",
    title: "List Customers",
    description: "this tool will list customers",
    inputSchema: {},
  };

  async execute(): Promise<CallToolResult> {
    const customers = await fetchCustomersList();
    const formattedText = customers.data.map((cust) => cust.name).join("\n");

    return {
      content: [
        {
          type: "text",
          text: formattedText,
        },
      ],
    };
  }
}
