import { MCPServer } from "./core/mcp-server/mcp-server";
import { ListCustomersTool } from "./features/customer/customer.module";

const mcpServer = MCPServer.getInstance();

mcpServer.registerTool(new ListCustomersTool()).start();
