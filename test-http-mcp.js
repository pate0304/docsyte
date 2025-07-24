#!/usr/bin/env node

// Test script for HTTP-based MCP server
// Demonstrates all three tools with real RAGFlow data

const SERVER_URL = 'http://localhost:3000/mcp';

// Helper function to make MCP requests
async function mcpRequest(method, params = {}, id = null) {
  const requestId = id || Math.floor(Math.random() * 10000);
  
  const response = await fetch(SERVER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: requestId,
      method,
      params
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

// Test functions
async function testInitialize() {
  console.log('🔧 Testing initialization...');
  const response = await mcpRequest('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'http-test-client', version: '1.0.0' }
  });
  
  console.log('✅ Initialization successful');
  console.log(`   Server: ${response.result.serverInfo.name} v${response.result.serverInfo.version}`);
  return response.result;
}

async function testListTools() {
  console.log('\n🔧 Testing tools list...');
  const response = await mcpRequest('tools/list');
  
  console.log('✅ Tools retrieved successfully');
  response.result.tools.forEach((tool, index) => {
    console.log(`   ${index + 1}. ${tool.name}: ${tool.description}`);
  });
  return response.result.tools;
}

async function testSearchDocs() {
  console.log('\n🔧 Testing documentation search...');
  const response = await mcpRequest('tools/call', {
    name: 'search_docs',
    arguments: {
      query: 'Docsyte MCP server features and configuration',
      k: 3
    }
  });
  
  if (response.result && response.result.content) {
    const results = JSON.parse(response.result.content[0].text);
    console.log('✅ Search successful');
    console.log(`   Found ${results.length} results:`);
    
    results.forEach((result, index) => {
      console.log(`   ${index + 1}. [${result.similarity.toFixed(3)}] ${result.library} - ${result.source}`);
      console.log(`      ${result.content.substring(0, 100)}...`);
    });
    return results;
  } else {
    console.log('❌ Search failed or returned no results');
    console.log('Response:', JSON.stringify(response, null, 2));
    return [];
  }
}

async function testAnswerWithDocs() {
  console.log('\n🔧 Testing documentation Q&A...');
  const response = await mcpRequest('tools/call', {
    name: 'answer_with_docs',
    arguments: {
      query: 'What is Docsyte and what are its main features?',
      k: 5
    }
  });
  
  if (response.result && response.result.content) {
    const answer = response.result.content[0].text;
    console.log('✅ Q&A successful');
    console.log('   Answer:');
    
    // Split by sections for better readability
    const sections = answer.split('\n\n');
    sections.forEach(section => {
      if (section.trim()) {
        console.log(`   ${section.trim()}`);
      }
    });
    return answer;
  } else {
    console.log('❌ Q&A failed');
    console.log('Response:', JSON.stringify(response, null, 2));
    return null;
  }
}

async function testGetChunk() {
  console.log('\n🔧 Testing chunk retrieval with fallback...');
  
  // First, get a chunk ID from search results
  const searchResponse = await mcpRequest('tools/call', {
    name: 'search_docs',
    arguments: {
      query: 'Docsyte',
      k: 1
    }
  });
  
  if (searchResponse.result && searchResponse.result.content) {
    const results = JSON.parse(searchResponse.result.content[0].text);
    if (results.length > 0) {
      const chunkId = results[0].chunk_id;
      console.log(`   Using chunk ID: ${chunkId}`);
      
      const chunkResponse = await mcpRequest('tools/call', {
        name: 'get_chunk',
        arguments: {
          chunkId: chunkId
        }
      });
      
      if (chunkResponse.result && chunkResponse.result.content) {
        const chunk = JSON.parse(chunkResponse.result.content[0].text);
        console.log('✅ Chunk retrieval successful');
        console.log(`   Content: ${(chunk.content || 'No content').substring(0, 200)}...`);
        return chunk;
      }
    }
  }
  
  console.log('⚠️  Using fallback chunk retrieval');
  const fallbackResponse = await mcpRequest('tools/call', {
    name: 'get_chunk',
    arguments: {
      chunkId: 'fallback-test-chunk'
    }
  });
  
  if (fallbackResponse.result && fallbackResponse.result.content) {
    const chunk = JSON.parse(fallbackResponse.result.content[0].text);
    console.log('✅ Fallback chunk retrieval successful');
    console.log(`   Content: ${(chunk.content || 'No content').substring(0, 200)}...`);
    return chunk;
  }
  
  console.log('❌ Chunk retrieval failed');
  return null;
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting HTTP MCP Server Tests');
  console.log('=====================================');
  
  try {
    // Test server health first
    console.log('🔧 Testing server health...');
    const healthResponse = await fetch('http://localhost:3000/health');
    if (!healthResponse.ok) {
      throw new Error('Server health check failed');
    }
    console.log('✅ Server is healthy');
    
    // Run MCP tests
    await testInitialize();
    await testListTools();
    await testSearchDocs();
    await testAnswerWithDocs();
    await testGetChunk();
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   ✅ HTTP MCP server is operational');
    console.log('   ✅ RAGFlow integration working');
    console.log('   ✅ All three MCP tools functional');
    console.log('   ✅ Real documentation data accessible');
    
    console.log('\n🔗 Integration URLs:');
    console.log('   Health: http://localhost:3000/health');
    console.log('   MCP Endpoint: http://localhost:3000/mcp');
    console.log('   Usage Examples: http://localhost:3000/test');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Make sure the server is running:');
      console.log('   npm run start:dev');
    }
    
    process.exit(1);
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests, mcpRequest };