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

## Project Structure

```
6_AI_model_context_protocol/
  mcp_server/
    src/
      data/users.json            # Simple JSON “database”
      server.ts                  # Server bootstrap; registers resources/tools/prompts
      resources/                 # Resource registrations
      tools/                     # Tool registrations
      prompts/                   # Prompt registrations
      types/                     # Shared types (e.g., User)
  mcp_client/
    src/client.ts                # Interactive CLI client
  package.json                   # Scripts for dev/build/run
  tsconfig.json                  # TypeScript config
```

## Requirements

- Node.js 20+ (recommended)
- npm 9+
- A Google Gemini API key for the client
  - Set `GEMINI_API_KEY` in your environment (e.g., a `.env` file)

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
   - You can obtain a key from Google AI Studio (see Google’s documentation).

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

When the client starts you’ll see a menu with four options:

- **Tools**
  - Select a tool to run. You’ll be prompted for its arguments.
  - Provided tools:
    - `create-user`: Enter `name`, `email`, `address`, `phone` to create a user.
    - `create-random-user`: The server requests a sampled user from the client’s LLM, then saves it.

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

## Extending the Server

- Add a new Resource/Tool/Prompt by creating a registration module under `mcp_server/src/resources`, `mcp_server/src/tools`, or `mcp_server/src/prompts`, and register it from `server.ts` (or the corresponding barrel if present).
- Keep business logic separate from registration code to maintain readability and testability.

## NPM Scripts

- `server:build` – Compile the MCP server to JavaScript
- `server:build:watch` – Compile the server in watch mode
- `server:dev` – Run the TypeScript server with `tsx`
- `server:inspect` – Launch the MCP Inspector against the dev server
- `client:dev` – Run the interactive MCP client
- `format` – Run Prettier across the repo
