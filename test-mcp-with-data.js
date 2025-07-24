#!/usr/bin/env node

// Test MCP server with real RAGFlow data
import { spawn } from 'child_process';

const serverProcess = spawn('node', ['apps/mcp-server/dist/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit'],
  env: {
    ...process.env,
    RAGFLOW_URL: 'http://localhost:80',
    RAGFLOW_API_KEY: 'ragflow-MxZTBhMGNjNjg0YTExZjBiNjUwYjJlZj'
  }
});

// Test messages
const messages = [
  {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'test-client', version: '1.0.0' }
    }
  },
  {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'search_docs',
      arguments: {
        query: 'Docsyte MCP server features',
        k: 3
      }
    }
  },
  {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'answer_with_docs',
      arguments: {
        query: 'What is Docsyte and what are its main features?',
        k: 5
      }
    }
  }
];

let responseCount = 0;
let buffer = '';

serverProcess.stdout.on('data', (data) => {
  buffer += data.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop(); // Keep incomplete line in buffer
  
  lines.forEach(line => {
    if (line.trim()) {
      try {
        const response = JSON.parse(line);
        responseCount++;
        
        console.log(`\n🔍 Response ${responseCount}:`);
        if (response.result && response.result.content) {
          const content = response.result.content[0].text;
          if (content.length > 500) {
            console.log(content.substring(0, 500) + '...\n[truncated]');
          } else {
            console.log(content);
          }
        } else {
          console.log(JSON.stringify(response, null, 2));
        }
        
        if (responseCount >= 3) {
          console.log('\n✅ All tests completed!');
          serverProcess.kill();
          process.exit(0);
        }
      } catch (e) {
        console.log('Raw:', line);
      }
    }
  });
});

// Send test messages with delays
messages.forEach((msg, index) => {
  setTimeout(() => {
    console.log(`\n📤 Sending: ${msg.method} (${msg.params?.name || 'init'})`);
    serverProcess.stdin.write(JSON.stringify(msg) + '\n');
  }, index * 2000);
});

// Timeout
setTimeout(() => {
  console.log('\n⏰ Test timeout');
  serverProcess.kill();
  process.exit(1);
}, 15000);

serverProcess.on('exit', () => {
  console.log('\n🏁 Server stopped');
});