"use server";

import { ChatOllama } from "@langchain/ollama";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import {
  mapStoredMessagesToChatMessages,
  StoredMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { execute } from "./database";

export async function message(messages: StoredMessage[]) {
  console.log("🚀 MESSAGE FUNCTION CALLED");
  console.log("📥 Input messages:", messages.length, "messages");
  console.log("📋 Messages types:", messages.map(m => m.type));
  
  const deserialized = mapStoredMessagesToChatMessages(messages);
  console.log("✅ Deserialized messages:", deserialized.length);

  const getFromDB = tool(
    async (input) => {
      console.log("🔧 DATABASE TOOL CALLED with input:", input);
      if (input?.sql) {
        console.log("📊 Executing SQL:", input.sql);

        try {
          const result = await execute(input.sql);
          
          // Enhanced response formatting with table format for frontend parsing
          if (Array.isArray(result) && result.length > 0) {
            // Convert JSON results to table format
            const keys = Object.keys(result[0]);
            const headerRow = `| ${keys.join(' | ')} |`;
            const separatorRow = `| ${keys.map(() => '---').join(' | ')} |`;
            const dataRows = result.map(row => 
              `| ${keys.map(key => row[key] || '').join(' | ')} |`
            ).join('\n');
            
            const tableFormatted = `${headerRow}\n${separatorRow}\n${dataRows}`;
            
            return `Query executed successfully! Found ${result.length} results:\n\nSQL Query: ${input.sql}\n\n${tableFormatted}`;
          } else if (Array.isArray(result) && result.length === 0) {
            return `Query executed successfully but returned no results.\n\nSQL Query: ${input.sql}`;
          } else {
            return `Query executed with result: ${JSON.stringify(result)}`;
          }
        } catch (error) {
          console.error("Database execution error:", error);
          return `Error executing query: ${error}. Please check your SQL syntax and try again.`;
        }
      }
      return "Please provide a valid SQL query.";
    },
    {
      name: "get_from_db",
      description: `Get data from a database with the following schema:

DATABASE SCHEMA:
      
TABLE: customer
- id (INTEGER, PRIMARY KEY)
- email (TEXT)
- name (TEXT)

TABLE: order  
- id (INTEGER, PRIMARY KEY)
- createdate (TEXT)
- shippingcost (REAL) 
- customerid (INTEGER, FOREIGN KEY to customer.id)
- carrier (TEXT)
- trackingid (TEXT)

IMPORTANT: Table names are 'customer' and 'order'. Always use single quotes around table and column names in SQL queries.

Example queries:
- SELECT COUNT(*) FROM 'customer'
- SELECT * FROM 'order' WHERE 'customerid' = 1
- SELECT c.'name', o.'createdate' FROM 'customer' c JOIN 'order' o ON c.'id' = o.'customerid'
      `,
      schema: z.object({
        sql: z
          .string()
          .describe(
            "SQL query to get data from a SQL database. Always put quotes around the field and table arguments. Table names are 'customer' and 'order'."
          ),
      }),
    }
  );

  try {
    console.log("🤖 Creating React Agent with llama3.2...");
    const agent = createReactAgent({
      llm: new ChatOllama({ 
        model: "llama3.2", 
        temperature: 0,
        baseUrl: "http://localhost:11434", // Explicit Ollama URL
        // Note: timeout is handled by the agent configuration
      }),
      tools: [getFromDB],
    });
    console.log("✅ Agent created successfully");

    // Add a system message at the beginning if not already present
    const hasSystemMessage = deserialized.some(msg => msg instanceof SystemMessage);
    console.log("🤖 Has system message:", hasSystemMessage);
    
    const systemMessage = new SystemMessage(`You are a helpful SQL assistant. You have access to a database with two tables:

1. TABLE 'customer' with columns: id, email, name
2. TABLE 'order' with columns: id, createdate, shippingcost, customerid, carrier, trackingid

IMPORTANT RULES:
- The database EXISTS and has data (20 customers, 30 orders)
- Always use the get_from_db tool to query the database
- Table names are 'customer' and 'order' (use single quotes)
- Always quote table and column names in SQL queries
- When asked about customers, query the 'customer' table
- When asked about orders, query the 'order' table
- Use JOIN queries to combine data from both tables when needed

Example queries:
- For customer count: SELECT COUNT(*) FROM 'customer'
- For all customers: SELECT * FROM 'customer'  
- For recent orders: SELECT * FROM 'order' ORDER BY 'createdate' DESC LIMIT 10

The database is fully functional - always use it to answer questions about customers and orders.`);

    const messagesToProcess = hasSystemMessage ? deserialized : [systemMessage, ...deserialized];
    console.log("📝 Total messages to process:", messagesToProcess.length);
    console.log("🔍 Final messages being sent to agent:", messagesToProcess.map(m => ({ 
      type: m.constructor.name, 
      messageType: m._getType()
    })));

    console.log("🎯 Invoking agent...");
    const response = await agent.invoke({
      messages: messagesToProcess,
    });

    console.log("🎉 Agent response received!");
    console.log("📤 Raw response:", response);
    console.log("📄 Response content:", response.messages[response.messages.length - 1].content);

    return response.messages[response.messages.length - 1].content;
  } catch (error) {
    console.error("❌ ERROR in message function:", error);
    const errorDetails = error as Error;
    console.error("📊 Error details:", {
      message: errorDetails?.message || 'Unknown error',
      stack: errorDetails?.stack || 'No stack trace',
      name: errorDetails?.name || 'Unknown error type'
    });
    return "Sorry, I encountered an error processing your request. Please try again.";
  }
}
