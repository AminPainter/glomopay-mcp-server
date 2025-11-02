import { MCPServer } from './core/mcp-server/mcp-server';
import { ListCustomersTool } from './features/customer/customer.module';
import { CreatePaymentLinkTool } from './features/payment-link/create-payment-link.tool';

const mcpServer = MCPServer.getInstance();

mcpServer.registerTool(new ListCustomersTool()).registerTool(new CreatePaymentLinkTool()).start();
