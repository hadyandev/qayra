import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "npx",
  args: ["-y", "@quranmcp/server"]
});
const client = new Client({ name: "test", version: "1.0.0" }, { capabilities: {} });

async function main() {
  await client.connect(transport);
  const tools = await client.listTools();
  console.log(JSON.stringify(tools, null, 2));
  process.exit(0);
}
main().catch(console.error);
