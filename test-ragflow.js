#!/usr/bin/env node

// Quick test to verify RAGFlow local instance is working
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testRAGFlow() {
  const ragflowUrl = 'http://localhost:9380';
  
  console.log('🧪 Testing RAGFlow local instance...');
  console.log(`📍 URL: ${ragflowUrl}`);
  
  try {
    // Test basic connectivity
    const response = await fetch(`${ragflowUrl}/v1/health`, {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.text();
      console.log('✅ RAGFlow is running!');
      console.log('📊 Response:', data);
    } else {
      console.log(`⚠️  RAGFlow responded with status: ${response.status}`);
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ RAGFlow is not accessible on port 9380');
      console.log('💡 Try: docker ps to check if containers are running');
    } else {
      console.log(`❌ Error connecting to RAGFlow: ${error.message}`);
    }
  }
  
  // Test if web interface is accessible
  try {
    const webResponse = await fetch(`${ragflowUrl}`, {
      method: 'GET',
      timeout: 5000
    });
    
    if (webResponse.ok) {
      console.log('✅ RAGFlow web interface is accessible');
      console.log(`🌐 Open in browser: ${ragflowUrl}`);
    }
  } catch (error) {
    console.log('❌ RAGFlow web interface not accessible');
  }
}

testRAGFlow().catch(console.error);