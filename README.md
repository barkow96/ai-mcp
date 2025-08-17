## Model Context Protocol Demo: MCP Server + Interactive Client

This repository demonstrates a minimal-but-practical setup for the Model Context Protocol (MCP): a TypeScript MCP server that exposes resources, tools, and prompts; and an interactive CLI client that connects to the server, lists capabilities, and lets you invoke them. The client additionally uses Google Gemini via the `ai` SDK to run inference for prompts and free-form queries.

### Key Capabilities

- **MCP Server (TypeScript)**
  - **Resources**: Read data from a local JSON database (`users.json`).
    - `users://all` – returns all users
    - `users://{userId}/profile` – returns details for a single user
  - **Tools**:
    - `create-user` – creates a user from provided fields
    - `create-random-user` – asks the client to sample a fake user via LLM, then persists it
  - **Prompts**:
    - `generate-fake-user` – produces a prompt template to create fake user data

- **Interactive MCP Client (TypeScript)**
  - Connects to the server over stdio
  - Lists and invokes Tools, Resources, and Prompts via a terminal menu
  - Runs free-form queries with LLM tool use (the model can call server tools during generation)
  - Supports sampling requests from the server

## Project Structure

```
6_AI_model_context_protocol/
  mcp_server/
    src/
      data/                          # Simple JSON "database"
      helpers/                       # User management utilities
      prompts/                       # Prompt template definitions
      resources/                     # Resource implementations
      tools/                         # Tool implementations
      types/                         # Shared type definitions
      server.ts                      # Server bootstrap
  mcp_client/
    src/
      config/                        # Global configuration
      handlers/                      # MCP interaction handlers
      mappers/                       # Type validation utilities
      sampling/                      # Sampling request handling
      types/                         # TypeScript type definitions
      ai.ts                          # AI/LLM integration
      client.ts                      # CLI client entry point
      mcp.ts                         # MCP client management
      menu.ts                        # Interactive menu system
  package.json                       # Scripts for dev/build/run
  tsconfig.json                      # TypeScript config
```

## Requirements

- Node.js 20+ (recommended)
- npm 9+
- A Google Gemini API key for the client
  - Set `GEMINI_API_KEY` in your environment (e.g., a `.env` file)
  - You can obtain a key from Google AI Studio (see Google's documentation)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables for the client:
   - Create a `.env` file at the project root:
     ```env
     GEMINI_API_KEY=your_google_gemini_api_key
     ```
   - You can obtain a key from Google AI Studio (see Google's documentation).

## Build and Run

The client spawns the server from the compiled output, so build the server first.

1. Build the server:

   ```bash
   npm run server:build
   ```

2. Run the interactive client (this will connect to the built server):
   ```bash
   npm run client:dev
   ```

Optional (standalone server run and inspection):

- Run the server directly in dev mode (for debugging):

  ```bash
  npm run server:dev
  ```

- Inspect the MCP server with the MCP Inspector:
  ```bash
  npm run server:inspect
  ```

## Using the Client

When the client starts you'll see a menu with four options:

- **Tools**
  - Select a tool to run. You'll be prompted for its arguments.
  - Provided tools:
    - `create-user`: Enter `name`, `email`, `address`, `phone` to create a user.
    - `create-random-user`: The server requests a sampled user from the client's LLM, then saves it.

- **Resources**
  - Browse server resources. If a resource has path parameters (e.g., `{userId}`), the client will prompt you for values.
  - Examples:
    - `users://all`
    - `users://{userId}/profile`

- **Prompts**
  - Pick a server prompt and (optionally) execute it locally with Gemini. The client prints the generated text.

- **Query**
  - Enter a free-form query. The client will run Gemini with tool support so the model can call server tools during generation. The final text or tool result is printed.

## Data Persistence

- User data is stored in `mcp_server/src/data/users.json`.
- Tools that modify users will persist changes back to this file.

## Architecture Details

### Client Architecture

The client is organized into several key modules:

- **`handlers/`**: Contains logic for handling different types of MCP interactions (tools, resources, prompts, queries)
- **`config/`**: Global configuration including AI model settings
- **`types/`**: TypeScript type definitions for the application
- **`mappers/`**: Utility functions for type validation and conversion
- **`sampling/`**: Handles sampling requests from the server
- **`ai.ts`**: Integration with Google Gemini AI
- **`mcp.ts`**: MCP client initialization and connection management
- **`menu.ts`**: Interactive menu system for user interaction

### Server Architecture

The server follows a modular structure:

- **`tools/`**: Tool implementations (create-user, create-random-user)
- **`resources/`**: Resource implementations (user data access)
- **`prompts/`**: Prompt template definitions
- **`helpers/`**: Utility functions for data management
- **`data/`**: Simple JSON-based data storage
- **`types/`**: Shared type definitions

### AI Integration

The client uses Google Gemini 2.0 Flash model for:

- Free-form queries with tool support
- Prompt execution
- Sampling requests from the server

The integration is handled through the `ai` SDK and configured via environment variables.
