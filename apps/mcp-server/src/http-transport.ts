// Custom HTTP transport for MCP server
// Wraps the existing MCP server with HTTP endpoints

import { EventEmitter } from 'events';
import { JSONRPCRequest, JSONRPCResponse, JSONRPCMessage } from '@modelcontextprotocol/sdk/types.js';

export interface Transport {
  start(): Promise<void>;
  send(message: JSONRPCMessage): Promise<void>;
  close(): Promise<void>;
  onmessage?: (message: JSONRPCMessage) => void;
  onerror?: (error: Error) => void;
  onclose?: () => void;
}

export class HTTPServerTransport extends EventEmitter implements Transport {
  private requestQueue: Array<{
    request: JSONRPCRequest;
    resolve: (response: JSONRPCResponse) => void;
    reject: (error: Error) => void;
  }> = [];

  onmessage?: (message: JSONRPCMessage) => void;
  onerror?: (error: Error) => void;
  onclose?: () => void;

  async start(): Promise<void> {
    // Transport is already started when created
    return Promise.resolve();
  }

  async send(message: JSONRPCMessage): Promise<void> {
    // Handle responses by resolving pending requests
    if ('result' in message || 'error' in message) {
      const response = message as JSONRPCResponse;
      const pending = this.requestQueue.find(p => 
        p.request.id === response.id
      );
      
      if (pending) {
        const index = this.requestQueue.indexOf(pending);
        this.requestQueue.splice(index, 1);
        
        if ('error' in response && response.error) {
          pending.reject(new Error((response.error as any)?.message || 'Unknown error'));
        } else {
          pending.resolve(response);
        }
      }
    }
  }

  async close(): Promise<void> {
    this.onclose?.();
  }

  // Custom method to handle HTTP requests
  async handleHTTPRequest(request: JSONRPCRequest): Promise<JSONRPCResponse> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ request, resolve, reject });
      
      // Send the request to the MCP server
      this.onmessage?.(request);
      
      // Set timeout for requests
      setTimeout(() => {
        const index = this.requestQueue.findIndex(p => p.request.id === request.id);
        if (index !== -1) {
          this.requestQueue.splice(index, 1);
          reject(new Error('Request timeout'));
        }
      }, 30000); // 30 second timeout
    });
  }
}