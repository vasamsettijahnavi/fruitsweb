import { NextResponse } from "next/server"

// GET a single order
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Create a mock order for the requested ID
    const order = {
      id: Number(id),
      buyer_name: "John Doe",
      buyer_email: "john@example.com",
      buyer_phone: "555-123-4567",
      delivery_address: "123 Main St, Anytown, USA",
      total_amount: 25.97,
      status: "PENDING",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [
        {
          id: 1,
          product_id: 1,
          quantity: 2,
          price: 3.99,
          product: {
            id: 1,
            name: "Organic Apples",
            price: 3.99,
            image_url: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb",
          },
        },
        {
          id: 2,
          product_id: 6,
          quantity: 3,
          price: 2.49,
          product: {
            id: 6,
            name: "Fresh Carrots",
            price: 2.49,
            image_url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37",
          },
        },
      ],
    }

    return NextResponse.json(order, {
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

    const result = await query(
      `
      SELECT o.*, 
             json_agg(
               json_build_object(
                 'id', oi.id,
                 'product_id', oi.product_id,
                 'quantity', oi.quantity,
                 'price', oi.price,
                 'product', (SELECT json_build_object(
                              'id', p.id,
                              'name', p.name,
                              'price', p.price,
                              'image_url', p.image_url
                            ) FROM products p WHERE p.id = oi.product_id)
               )
             ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1
      GROUP BY o.id
    `,
      [id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
    */
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

// UPDATE order status
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { status } = await request.json()

    // Validate status
    const validStatuses = ["PENDING", "IN_PROGRESS", "DELIVERED", "CANCELLED"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: PENDING, IN_PROGRESS, DELIVERED, CANCELLED" },
        { status: 400 },
      )
    }

    // Mock updated order
    const updatedOrder = {
      id: Number(id),
      status,
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json(updatedOrder, {
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

    // Check if order exists
    const checkResult = await query("SELECT * FROM orders WHERE id = $1", [id])
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Update the order status
    const result = await query(
      `UPDATE orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id],
    )

    return NextResponse.json(result.rows[0])
    */
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
  }
}
