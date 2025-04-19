"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

type OrderItem = {
  id: number
  product_id: number
  quantity: number
  price: number
  product: {
    id: number
    name: string
    price: number
    image_url: string | null
  }
}

type Order = {
  id: number
  buyer_name: string
  buyer_email: string
  buyer_phone: string
  delivery_address: string
  total_amount: number
  status: "PENDING" | "IN_PROGRESS" | "DELIVERED" | "CANCELLED"
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export default function TrackOrderPage() {
  const searchParams = useSearchParams()
  const initialOrderId = searchParams.get("orderId") || ""

  const [orderId, setOrderId] = useState(initialOrderId)
  const [searchOrderId, setSearchOrderId] = useState(initialOrderId)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (searchOrderId) {
      fetchOrder(searchOrderId)
    }
  }, [searchOrderId])

  const fetchOrder = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/${id}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Order not found. Please check the order ID and try again.")
        }
        throw new Error("Failed to fetch order details")
      }

      const data = await response.json()
      setOrder(data)
    } catch (err) {
      console.error("Error fetching order:", err)
      setError(err instanceof Error ? err.message : "An error occurred while fetching the order")
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (orderId) {
      setSearchOrderId(orderId)
    }
  }

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Pending</span>
      case "IN_PROGRESS":
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">In Progress</span>
      case "DELIVERED":
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Delivered</span>
      case "CANCELLED":
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Cancelled</span>
      default:
        return null
    }
  }

  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return "Your order has been received and is being processed."
      case "IN_PROGRESS":
        return "Your order is on its way to you!"
      case "DELIVERED":
        return "Your order has been delivered. Enjoy!"
      case "CANCELLED":
        return "This order has been cancelled."
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen bg-green-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-green-700 hover:text-green-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-green-800 mb-6">Track Your Order</h1>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter your order ID"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
              disabled={!orderId || loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              Track
            </button>
          </form>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        {order && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Order #{order.id}</h2>
                <div>{getStatusBadge(order.status)}</div>
              </div>

              <p className="text-gray-600 mb-4">{getStatusText(order.status)}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Order Date</p>
                  <p className="font-medium">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Delivery Address</p>
                  <p className="font-medium">{order.delivery_address}</p>
                </div>
                <div>
                  <p className="text-gray-500">Contact</p>
                  <p className="font-medium">{order.buyer_phone}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{order.buyer_email}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="font-semibold mb-4">Order Items</h3>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-3">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden mr-3">
                        {item.product.image_url ? (
                          <img
                            src={item.product.image_url || "/placeholder.svg"}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
                            No image
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-500">
                          ${Number(item.price).toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="font-medium">${(Number(item.price) * item.quantity).toFixed(2)}</div>
                  </div>
                ))}

                <div className="pt-4 flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>${Number(order.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
