import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["-y", "@quranmcp/server@latest"]
  });
  
  const client = new Client({ name: "qayra", version: "1.0.0" }, { capabilities: {} });
  await client.connect(transport);
  
  const result = await client.callTool({
    name: "get_random_hadith",
    arguments: {}
  });
  
  console.log(result.content[0].text);
  await transport.close();
  process.exit(0);
}

main().catch(err => {
  console.error("{\"error\": \"" + err.message + "\"}");
  process.exit(1);
});
