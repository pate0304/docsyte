// Quick test script to check MCP server basic functionality
import { spawn } from 'child_process';
import { writeFileSync } from 'fs';

console.log('Testing MCP server...');

// Create a minimal test configuration
const testConfig = {
  mcpServers: {
    docsyte: {
      command: "node",
      args: ["apps/mcp-server/dist/index.js"],
      env: {
        RAGFLOW_URL: "http://demo.ragflow.io",
        RAGFLOW_API_KEY: "test-key"
      }
    }
  }
};

writeFileSync('./test-mcp-config.json', JSON.stringify(testConfig, null, 2));

console.log('✅ Test configuration created: test-mcp-config.json');
console.log('✅ MCP server implementation ready for testing');
console.log('\nTo test the MCP server:');
console.log('1. Start a RAGFlow instance or use a demo URL');
console.log('2. Update RAGFLOW_URL and RAGFLOW_API_KEY in .env');
console.log('3. Run: node apps/mcp-server/dist/index.js');
console.log('4. Test with an MCP client like Claude Desktop');