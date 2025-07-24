#!/usr/bin/env python3
"""
RAGFlow Document Ingestion Script
Feeds data into your RAGFlow instance for the Docsyte MCP server
"""

import requests
import json
import os
import sys
from pathlib import Path
from typing import List, Optional
import time

class RAGFlowIngester:
    def __init__(self, base_url: str = "http://localhost:9380", api_key: Optional[str] = None):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.session = requests.Session()
        
        if api_key:
            self.session.headers.update({
                "Authorization": f"Bearer {api_key}"
            })
    
    def test_connection(self) -> bool:
        """Test if RAGFlow is accessible"""
        try:
            response = self.session.get(f"{self.base_url}/api/v1/datasets")
            return response.status_code in [200, 401]  # 401 means server is up but needs auth
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            return False
    
    def create_knowledge_base(self, name: str, description: str = "") -> Optional[str]:
        """Create a new knowledge base (dataset)"""
        data = {
            "name": name,
            "description": description,
            "embedding_model": "BAAI/bge-large-zh-v1.5@BAAI",
            "permission": "me",
            "chunk_method": "naive",
            "parser_config": {
                "chunk_token_num": 512,
                "delimiter": "\n",
                "html4excel": False,
                "layout_recognize": "DeepDOC",
                "raptor": {"use_raptor": False},
                "graphrag": {"use_graphrag": False}
            }
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/v1/datasets",
                json=data
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("code") == 0:
                    dataset_id = result["data"]["dataset_id"]
                    print(f"✅ Created knowledge base '{name}' with ID: {dataset_id}")
                    return dataset_id
                else:
                    print(f"❌ Failed to create knowledge base: {result.get('message')}")
            else:
                print(f"❌ HTTP Error {response.status_code}: {response.text}")
                
        except Exception as e:
            print(f"❌ Error creating knowledge base: {e}")
            
        return None
    
    def list_knowledge_bases(self) -> List[dict]:
        """List all knowledge bases"""
        try:
            response = self.session.get(f"{self.base_url}/api/v1/datasets")
            
            if response.status_code == 200:
                result = response.json()
                if result.get("code") == 0:
                    return result["data"]["datasets"]
            else:
                print(f"❌ HTTP Error {response.status_code}: {response.text}")
                
        except Exception as e:
            print(f"❌ Error listing knowledge bases: {e}")
            
        return []
    
    def upload_document(self, dataset_id: str, file_path: Path) -> bool:
        """Upload a document to a knowledge base"""
        if not file_path.exists():
            print(f"❌ File not found: {file_path}")
            return False
        
        try:
            with open(file_path, 'rb') as f:
                files = {"file": f}
                headers = {"Authorization": f"Bearer {self.api_key}"} if self.api_key else {}
                
                response = requests.post(
                    f"{self.base_url}/api/v1/datasets/{dataset_id}/documents",
                    headers=headers,
                    files=files
                )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("code") == 0:
                    print(f"✅ Uploaded: {file_path.name}")
                    return True
                else:
                    print(f"❌ Upload failed for {file_path.name}: {result.get('message')}")
            else:
                print(f"❌ HTTP Error {response.status_code} for {file_path.name}: {response.text}")
                
        except Exception as e:
            print(f"❌ Error uploading {file_path.name}: {e}")
            
        return False
    
    def trigger_processing(self, dataset_id: str, document_ids: List[str]) -> bool:
        """Trigger document processing (chunking and embedding)"""
        try:
            response = self.session.post(
                f"{self.base_url}/api/v1/datasets/{dataset_id}/chunks",
                json={"document_ids": document_ids}
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("code") == 0:
                    print(f"✅ Processing triggered for {len(document_ids)} documents")
                    return True
                else:
                    print(f"❌ Processing failed: {result.get('message')}")
            else:
                print(f"❌ HTTP Error {response.status_code}: {response.text}")
                
        except Exception as e:
            print(f"❌ Error triggering processing: {e}")
            
        return False
    
    def search_documents(self, dataset_id: str, query: str, top_k: int = 5) -> List[dict]:
        """Search documents in a knowledge base"""
        try:
            response = self.session.post(
                f"{self.base_url}/api/v1/retrieval",
                json={
                    "question": query,
                    "dataset_ids": [dataset_id],
                    "top_k": top_k,
                    "similarity_threshold": 0.2,
                    "vector_similarity_weight": 0.3
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("code") == 0:
                    return result["data"]["chunks"]
            else:
                print(f"❌ HTTP Error {response.status_code}: {response.text}")
                
        except Exception as e:
            print(f"❌ Error searching: {e}")
            
        return []

def main():
    # Configuration
    RAGFLOW_URL = os.getenv("RAGFLOW_URL", "http://localhost:9380")
    RAGFLOW_API_KEY = os.getenv("RAGFLOW_API_KEY")
    
    if not RAGFLOW_API_KEY:
        print("🔑 To use this script, you need a RAGFlow API key:")
        print("1. Open http://localhost:9380 in your browser")
        print("2. Click your avatar → API → Generate API Key")
        print("3. Set the environment variable: export RAGFLOW_API_KEY='your-key-here'")
        print("\n🚀 For now, I'll test the connection without authentication...")
    
    # Initialize ingester
    ingester = RAGFlowIngester(RAGFLOW_URL, RAGFLOW_API_KEY)
    
    # Test connection
    print(f"🔗 Testing connection to {RAGFLOW_URL}...")
    if not ingester.test_connection():
        print("❌ Cannot connect to RAGFlow. Make sure it's running on http://localhost:9380")
        return
    
    print("✅ RAGFlow is accessible!")
    
    # List existing knowledge bases
    print("\n📚 Existing knowledge bases:")
    kbs = ingester.list_knowledge_bases()
    for kb in kbs:
        print(f"  - {kb.get('name', 'Unknown')} (ID: {kb.get('id', 'Unknown')})")
    
    if not RAGFLOW_API_KEY:
        print("\n⚠️  Without an API key, I can't create knowledge bases or upload documents.")
        print("Get your API key from the RAGFlow web UI to continue!")
        return
    
    # Example: Create a test knowledge base
    print("\n🏗️  Creating example knowledge base...")
    kb_id = ingester.create_knowledge_base(
        name="docsyte-test", 
        description="Test knowledge base for Docsyte MCP server"
    )
    
    if kb_id:
        print(f"\n📄 Knowledge base created! You can now:")
        print(f"  1. Upload documents via web UI: http://localhost:9380")
        print(f"  2. Use the API with dataset ID: {kb_id}")
        print(f"  3. Test your MCP server with this knowledge base")
        
        # Example search
        print(f"\n🔍 Testing search...")
        results = ingester.search_documents(kb_id, "test query", top_k=3)
        print(f"Found {len(results)} results")

if __name__ == "__main__":
    main()