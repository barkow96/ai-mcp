import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fs from "node:fs/promises";
import { z } from "zod";
import { User } from "./types";

const server = new McpServer({
	name: "mcp-server",
	version: "1.0.0",
	capabilities: {
		resources: {},
		tools: {},
		prompts: {},
	},
});

// Tool to create a new user in the database
server.tool(
	"create-user",
	"Create a new user in the database",
	{
		name: z.string(),
		email: z.string(),
		address: z.string(),
		phone: z.string(),
	},
	{
		title: "Create User",
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: false,
		openWorldHint: true,
	},
	async (params) => {
		try {
			const id = await createUser(params);
			return { content: [{ type: "text", text: `User ${id} created successfully` }] };
		} catch {
			return { content: [{ type: "text", text: "Failed to save user" }] };
		}
	}
);

// Resource to get all users
server.resource(
	"users",
	"users://all",
	{
		description: "Get all users data from the database",
		title: "Users",
		mimeType: "application/json",
	},
	async (uri) => {
		const users = await import("./data/users.json", { with: { type: "json" } }).then((m) => m.default);

		return { contents: [{ uri: uri.href, text: JSON.stringify(users), mimeType: "application/json" }] };
	}
);

// Resource template to get user details by ID
server.resource(
	"user-details",
	new ResourceTemplate("users://{userId}/profile", { list: undefined }),
	{
		description: "Get a user's details from the database",
		title: "User Details",
		mimeType: "application/json",
	},
	async (uri, { userId }) => {
		const users = await import("./data/users.json", { with: { type: "json" } }).then((m) => m.default);

		const searchedId = Array.isArray(userId) ? userId[0] : userId;

		const searchedUser = users.find((u) => u.id === parseInt(searchedId));

		if (!searchedUser) {
			return { contents: [{ uri: uri.href, text: JSON.stringify({ error: "User not found" }), mimeType: "application/json" }] };
		}

		return { contents: [{ uri: uri.href, text: JSON.stringify(searchedUser), mimeType: "application/json" }] };
	}
);

// Tool to generate a text of prompt for creating a fake user (can be used in a chat interface)
server.prompt("generate-fake-user", "Generate a fake user based on a given name ", { name: z.string() }, ({ name }) => {
	return {
		messages: [
			{
				role: "user",
				content: {
					type: "text",
					text: `Generate a fake user with the name ${name}. The user should have a realsitic email, address, and phone number.`,
				},
			},
		],
	};
});

async function createUser(user: User) {
	const users = await import("./data/users.json", { with: { type: "json" } }).then((m) => m.default);

	const id = users.length + 1;

	users.push({ id, ...user });

	fs.writeFile("./mcp_server/src/data/users.json", JSON.stringify(users, null, 2));

	return id;
}

async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
}

main();
