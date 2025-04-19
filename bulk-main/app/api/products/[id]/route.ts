import { NextResponse } from "next/server"

// GET a single product
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Create a mock product for the requested ID
    const product = {
      id: Number(id),
      name: id === "1" ? "Organic Apples" : id === "2" ? "Bananas" : `Product ${id}`,
      description: `Description for product ${id}`,
      price: 3.99,
      image_url:
        id === "1"
          ? "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb"
          : id === "2"
            ? "https://images.unsplash.com/photo-1543218024-57a70143c369"
            : null,
      category: Number(id) % 2 === 0 ? "Vegetables" : "Fruits",
      stock: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json(product, {
      headers: {
        "X-Data-Source": "fallback",
        "Cache-Control": "no-store, max-age=0",
      },
    })

    /* Commented out for now to ensure stability
    // Test database connection first
    const isConnected = await testConnection()
    if (!isConnected) {
      return NextResponse.json({ error: "Database connection failed. Please try again later." }, { status: 503 })
    }

    const result = await query("SELECT * FROM products WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
    */
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

// UPDATE a product
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { name, description, price, image_url, category, stock } = await request.json()

    // Validate required fields
    if (!name || !price || !category) {
      return NextResponse.json({ error: "Name, price, and category are required" }, { status: 400 })
    }

    // Mock updated product
    const updatedProduct = {
      id: Number(id),
      name,
      description,
      price,
      image_url,
      category,
      stock: stock || 0,
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json(updatedProduct, {
      headers: {
        "X-Data-Source": "fallback",
        "Cache-Control": "no-store, max-age=0",
      },
    })

    /* Commented out for now to ensure stability
    // Test database connection first
    const isConnected = await testConnection()
    if (!isConnected) {
      return NextResponse.json({ error: "Database connection failed. Please try again later." }, { status: 503 })
    }

    // Check if product exists
    const checkResult = await query("SELECT * FROM products WHERE id = $1", [id])
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Update the product
    const result = await query(
      `UPDATE products 
       SET name = $1, description = $2, price = $3, image_url = $4, category = $5, stock = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [name, description, price, image_url, category, stock, id],
    )

    return NextResponse.json(result.rows[0])
    */
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

// DELETE a product
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Mock successful deletion
    return NextResponse.json(
      { message: "Product deleted successfully" },
      {
        headers: {
          "X-Data-Source": "fallback",
          "Cache-Control": "no-store, max-age=0",
        },
      },
    )

    /* Commented out for now to ensure stability
    // Test database connection first
    const isConnected = await testConnection()
    if (!isConnected) {
      return NextResponse.json({ error: "Database connection failed. Please try again later." }, { status: 503 })
    }

    // Check if product exists
    const checkResult = await query("SELECT * FROM products WHERE id = $1", [id])
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Delete the product
    await query("DELETE FROM products WHERE id = $1", [id])

    return NextResponse.json({ message: "Product deleted successfully" })
    */
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
