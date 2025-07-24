#!/usr/bin/env node

// Advanced test script for MCP server
import { spawn } from 'child_process';

const serverProcess = spawn('node', ['apps/mcp-server/dist/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit']
});

// Test initialization message
const initMessage = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  }
};

// Test list tools message
const listToolsMessage = {
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/list',
  params: {}
};

// Test search_docs tool call
const searchDocsMessage = {
  jsonrpc: '2.0',
  id: 3,
  method: 'tools/call',
  params: {
    name: 'search_docs',
    arguments: {
      query: 'test search',
      k: 3
    }
  }
};

let responseCount = 0;

serverProcess.stdout.on('data', (data) => {
  const responses = data.toString().trim().split('\n');
  responses.forEach(response => {
    if (response) {
      try {
        const parsed = JSON.parse(response);
        console.log(`Response ${++responseCount}:`, JSON.stringify(parsed, null, 2));
        
        if (responseCount === 3) {
          // All tests completed
          console.log('\n✅ MCP server test completed successfully!');
          serverProcess.kill();
          process.exit(0);
        }
      } catch (e) {
        console.log('Raw response:', response);
      }
    }
  });
});

// Send test messages
setTimeout(() => {
  serverProcess.stdin.write(JSON.stringify(initMessage) + '\n');
}, 100);

setTimeout(() => {
  serverProcess.stdin.write(JSON.stringify(listToolsMessage) + '\n');
}, 500);

setTimeout(() => {
  serverProcess.stdin.write(JSON.stringify(searchDocsMessage) + '\n');
}, 1000);

// Timeout after 5 seconds
setTimeout(() => {
  console.log('❌ Test timed out');
  serverProcess.kill();
  process.exit(1);
}, 5000);

serverProcess.on('exit', (code) => {
  if (code !== 0) {
    console.log(`❌ Server exited with code ${code}`);
    process.exit(1);
  }
});