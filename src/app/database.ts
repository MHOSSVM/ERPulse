"use server";

import sqlite3 from "sqlite3";
import { customerTable, orderTable } from "./constants";

const db = new sqlite3.Database(":memory:");

export async function seed() {
  console.log("Starting database seeding...");
  db.serialize(() => {
    console.log("Creating customer table...");
    db.run(customerTable, (err) => {
      if (err) console.error("Error creating customer table:", err);
      else console.log("Customer table created successfully");
    });
    
    console.log("Creating order table...");
    db.run(orderTable, (err) => {
      if (err) console.error("Error creating order table:", err);
      else console.log("Order table created successfully");
    });

    console.log("Inserting customer data...");
    db.run(`
REPLACE INTO 'customer' ('id', 'email', 'name')  
VALUES  
    (1, 'lucas.bill@example.com', 'Lucas Bill'),  
    (2, 'mandy.jones@example.com', 'Mandy Jones'),  
    (3, 'salim.ali@example.com', 'Salim Ali'),  
    (4, 'jane.xiu@example.com', 'Jane Xiu'),  
    (5, 'john.doe@example.com', 'John Doe'),  
    (6, 'jane.smith@example.com', 'Jane Smith'),  
    (7, 'sandeep.bhushan@example.com', 'Sandeep Bhushan'),  
    (8, 'george.han@example.com', 'George Han'),  
    (9, 'asha.kumari@example.com', 'Asha Kumari'),  
    (10, 'salma.khan@example.com', 'Salma Khan'),
    (11, 'alex.rodriguez@example.com', 'Alex Rodriguez'),
    (12, 'priya.patel@example.com', 'Priya Patel'),
    (13, 'david.chen@example.com', 'David Chen'),
    (14, 'maria.garcia@example.com', 'Maria Garcia'),
    (15, 'ahmed.hassan@example.com', 'Ahmed Hassan'),
    (16, 'sophie.martin@example.com', 'Sophie Martin'),
    (17, 'raj.kumar@example.com', 'Raj Kumar'),
    (18, 'emma.wilson@example.com', 'Emma Wilson'),
    (19, 'carlos.lopez@example.com', 'Carlos Lopez'),
    (20, 'anna.kowalski@example.com', 'Anna Kowalski');
    `, (err) => {
      if (err) console.error("Error inserting customer data:", err);
      else console.log("Customer data inserted successfully");
    });

    console.log("Inserting order data...");
    db.run(`
REPLACE INTO 'order' ('id', 'createdate', 'shippingcost', 'customerid', 'carrier', 'trackingid')
VALUES
    (1, '2024-08-05', 3.99, 4, 'FedEx', 'FX123456789'),
    (2, '2024-08-02', 2.99, 6, 'UPS', 'UP987654321'),
    (3, '2024-08-04', 1.99, 10, 'USPS', 'US555666777'),
    (4, '2024-08-03', 4.99, 8, 'DHL', 'DH111222333'),
    (5, '2024-08-10', 3.49, 10, 'FedEx', 'FX444555666'),
    (6, '2024-08-01', 2.99, 3, 'UPS', 'UP777888999'),
    (7, '2024-08-02', 1.99, 4, 'USPS', 'US222333444'),
    (8, '2024-08-04', 5.99, 2, 'DHL', 'DH666777888'),
    (9, '2024-08-07', 3.99, 8, 'FedEx', 'FX999000111'),
    (10, '2024-08-09', 2.49, 9, 'UPS', 'UP333444555'),
    (11, '2024-08-07', 4.49, 7, 'USPS', 'US888999000'),
    (12, '2024-08-03', 3.99, 9, 'DHL', 'DH444555666'),
    (13, '2024-08-06', 2.99, 5, 'FedEx', 'FX777888999'),
    (14, '2024-08-01', 1.99, 2, 'UPS', 'UP111222333'),
    (15, '2024-08-05', 3.49, 3, 'USPS', 'US666777888'),
    (16, '2024-08-02', 4.99, 5, 'DHL', 'DH222333444'),
    (17, '2024-08-03', 2.99, 7, 'FedEx', 'FX555666777'),
    (18, '2024-08-06', 1.99, 6, 'UPS', 'UP888999000'),
    (19, '2024-08-04', 3.99, 1, 'USPS', 'US444555666'),
    (20, '2024-08-01', 2.49, 1, 'DHL', 'DH777888999'),
    (21, '2024-08-08', 5.99, 11, 'FedEx', 'FX101112131'),
    (22, '2024-08-09', 3.49, 12, 'UPS', 'UP141516171'),
    (23, '2024-08-10', 2.99, 13, 'USPS', 'US181920212'),
    (24, '2024-08-11', 4.49, 14, 'DHL', 'DH222324252'),
    (25, '2024-08-12', 1.99, 15, 'FedEx', 'FX262728293'),
    (26, '2024-08-13', 3.99, 16, 'UPS', 'UP303132333'),
    (27, '2024-08-14', 2.49, 17, 'USPS', 'US343536373'),
    (28, '2024-08-15', 5.49, 18, 'DHL', 'DH383940414'),
    (29, '2024-08-16', 3.99, 19, 'FedEx', 'FX424344454'),
    (30, '2024-08-17', 2.99, 20, 'UPS', 'UP464748495');    
    `, (err) => {
      if (err) console.error("Error inserting order data:", err);
      else console.log("Order data inserted successfully");
    });
  });
  console.log("Database seeding completed");
}

export async function execute(sql: string) {
  return await new Promise((resolve, reject) => {
    try {
      // Basic SQL injection protection
      const dangerousPatterns = [
        /DROP\s+TABLE/i,
        /DELETE\s+FROM/i,
        /TRUNCATE/i,
        /ALTER\s+TABLE/i,
        /CREATE\s+TABLE/i,
        /INSERT\s+INTO/i,
        /UPDATE\s+SET/i
      ];
      
      const isDangerous = dangerousPatterns.some(pattern => pattern.test(sql));
      if (isDangerous) {
        resolve("Error: Only SELECT queries are allowed for security reasons.");
        return;
      }

      // Track execution time
      const startTime = performance.now();

      // Add timeout for query execution
      const timeout = setTimeout(() => {
        reject(new Error("Query timeout: Query took too long to execute"));
      }, 10000); // 10 second timeout

      db.all(sql, (error, result) => {
        clearTimeout(timeout);
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        if (error) {
          console.log({ error, executionTime });
          resolve(`SQL Error: ${error.message}`);
        } else {
          console.log({ 
            result, 
            executionTime: `${executionTime.toFixed(2)}ms`,
            queryTime: new Date().toISOString(),
            resultCount: Array.isArray(result) ? result.length : 0
          });
          
          // Add performance metadata to result
          if (Array.isArray(result)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (result as any)._performance = {
              executionTime,
              timestamp: new Date(),
              resultCount: result.length
            };
          }
          
          resolve(result);
        }
      });
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
}

export async function verifyDatabaseState() {
  console.log("🔍 Verifying database state...");
  
  return new Promise((resolve) => {
    // Check if tables exist
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
      if (err) {
        console.error("❌ Error checking tables:", err);
        resolve({ success: false, error: err.message });
        return;
      }
      
      console.log("📋 Available tables:", tables);
      
      // Check customer table data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      db.all("SELECT COUNT(*) as count FROM 'customer'", (err, customerCount: any) => {
        if (err) {
          console.error("❌ Error counting customers:", err);
          resolve({ 
            success: false, 
            tables,
            error: `Customer table error: ${err.message}` 
          });
          return;
        }
        
        // Check order table data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        db.all("SELECT COUNT(*) as count FROM 'order'", (err, orderCount: any) => {
          if (err) {
            console.error("❌ Error counting orders:", err);
            resolve({ 
              success: false, 
              tables,
              customerCount: customerCount[0]?.count || 0,
              error: `Order table error: ${err.message}` 
            });
            return;
          }
          
          const state = {
            success: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tables: (tables as any[]).map((t: any) => t.name),
            customerCount: customerCount[0]?.count || 0,
            orderCount: orderCount[0]?.count || 0
          };
          
          console.log("✅ Database state verified:", state);
          resolve(state);
        });
      });
    });
  });
}
