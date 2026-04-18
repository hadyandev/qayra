import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "npx",
  args: ["-y", "@quranmcp/server"]
});
const client = new Client({ name: "test", version: "1.0.0" }, { capabilities: {} });

async function main() {
  await client.connect(transport);
  const result = await client.callTool({ name: "get_random_hadith" });
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}
main().catch(console.error);
