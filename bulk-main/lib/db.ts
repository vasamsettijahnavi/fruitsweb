import { Pool } from "pg"

// Create a singleton pool instance
let pool: Pool | null = null

// Initialize the database connection pool
export function getPool() {
  if (!pool) {
    // Check if DATABASE_URL is defined
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL environment variable is not defined")
      throw new Error("DATABASE_URL environment variable is not defined")
    }

    // Create a new pool
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      // Add connection timeout
      connectionTimeoutMillis: 5000,
      // Limit number of clients
      max: 20,
    })

    // Add error handler
    pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err)
      // Don't exit the process, just log the error
      pool = null
    })
  }
  return pool
}

// Helper function to execute SQL queries with better error handling
export async function query(text: string, params?: any[]) {
  const start = Date.now()
  let client = null

  try {
    // Get the pool
    const pool = getPool()

    // Get a client from the pool
    client = await pool.connect()

    // Execute the query
    const res = await client.query(text, params)

    const duration = Date.now() - start
    console.log("Executed query", { text, duration, rows: res.rowCount })

    return res
  } catch (error) {
    console.error("Error executing query", { text, error })
    throw error
  } finally {
    // Release the client back to the pool
    if (client) {
      client.release()
    }
  }
}

// Function to test the database connection
export async function testConnection() {
  try {
    const result = await query("SELECT 1 as test")
    return result.rows.length > 0
  } catch (error) {
    console.error("Database connection test failed:", error)
    return false
  }
}

// Ensure query is exported
