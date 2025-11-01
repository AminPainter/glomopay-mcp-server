# Glomopay MCP Server

An MCP (Model Context Protocol) server that enables Large Language Models to interact with Glomopay's external APIs using natural language.

## Prerequisites

- Node.js (v18 or higher)
- pnpm (v10.10.0 or higher)
- Claude Desktop application

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Build the Project

Compile TypeScript to JavaScript:

```bash
pnpm build
```

This will generate the compiled code in the `dist/` directory.

### 3. Configure Claude Desktop

#### Step 1: Open/Create Claude Desktop Config

Open the Claude Desktop configuration file:

```bash
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

If the file doesn't exist, create it with an empty JSON object:

```json
{
  "mcpServers": {}
}
```

#### Step 2: Add Glomopay MCP Server Configuration

Add the following configuration to the `mcpServers` object:

```json
{
  "mcpServers": {
    "glomopay": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/glomopay-mcp/dist/index.js"],
      "env": {
        "API_SECRET_KEY": "your_api_secret_key_here",
        "API_HOST": "http://localhost:3000"
      }
    }
  }
}
```

**Important**: Replace the following values with your own:

- **Path**: Update `/ABSOLUTE/PATH/TO/glomopay-mcp/dist/index.js` with the absolute path to your project's `dist/index.js` file
- **API_SECRET_KEY**: Use your own Glomopay API secret key (JWT token)
- **API_HOST**: Set to the URL where your Glomopay Rails application is running

#### Example Configuration

```json
{
  "mcpServers": {
    "glomopay": {
      "command": "node",
      "args": [
        "/Users/aminpainter/Desktop/Glomopay Projects/glomopay-mcp/dist/index.js"
      ],
      "env": {
        "API_SECRET_KEY": "eyJhbGciOiJSUzI1NiJ9.eyJlbnYiOiJwcm9kdWN0aW9uIiwiZXhwIjo0OTEzNzE1OTg1LCJpYXQiOjE3NTgwNDIzODUsImF1ZCI6ImxvY2FsaG9zdDozMDAwIiwiaXNzIjoibG9jYWxob3N0OjMwMDAiLCJzdWIiOiJtZXJjaF82ODViYjk5ZUZoUEdBIiwianRpIjoiMjYyZmVjYTItNmYxMC00Njg4LTllMzktM2MzNDRmMTNiNjQ0In0.YmJyLpRNhvJXO8QHFNDKZ0O1LMvGrRgMw7hk4V4ByIA9uEI04IQPlqULacdbmuxaDUboasbMizKSrwvOLqtWSxspojwcwiOk6GV9nCIuAdr-xpL_SCflzHl07EdRXYcM6WPDQqGkZmRK-ZJvnaWxlkv6e4PoIPIhlqEM2DVU8LMe0YdryhBQhtMxc2rwuaGkNEO2_N7hrIOHu0aqPEojYsONJ-kqcBz7i-OneeChdRth0DLz3M0-pRhp-sNxJ-G0DoL9eaQoM0kekh3HtQCZuIn8-ZV_O5XiueEjbPoFnQTp-T0s-MfB0_iXnQxvBj79dUNsL9Mi-d3y3zsKaFpkow",
        "API_HOST": "http://localhost:3000"
      }
    }
  }
}
```

### 4. Restart Claude Desktop

After updating the configuration:

1. Completely quit Claude Desktop (Cmd+Q on macOS)
2. Reopen Claude Desktop

### 5. Verify Installation

1. Open Claude Desktop
2. Look for the **filters button** (funnel icon) next to the plus button in the Claude Desktop interface
3. Click on it to see the list of available MCP servers
4. Verify that **"Glomopay"** appears in the list

If you see Glomopay in the list, the MCP server is successfully configured and ready to use!
