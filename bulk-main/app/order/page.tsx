"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Product = {
  id: number
  name: string
  description: string | null
  price: number
  image_url: string | null
  category: string
  stock: number
}

type CartItem = {
  product: Product
  quantity: number
}

export default function OrderPage() {
  const router = useRouter()
  const [cart, setCart] = useState<Map<number, CartItem>>(new Map())
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [buyerName, setBuyerName] = useState("")
  const [buyerEmail, setBuyerEmail] = useState("")
  const [buyerPhone, setBuyerPhone] = useState("")

  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products")
        if (!response.ok) {
          throw new Error("Failed to fetch products")
        }
        const data = await response.json()
        setProducts(data)
      } catch (err) {
        console.error("Failed to load products", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()

    // Load cart from localStorage
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        const newCart = new Map()
        Object.entries(parsedCart).forEach(([id, item]) => {
          newCart.set(Number(id), item as CartItem)
        })
        setCart(newCart)
      } catch (e) {
        console.error("Failed to parse saved cart", e)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const cartObj = Object.fromEntries(cart)
    localStorage.setItem("cart", JSON.stringify(cartObj))
  }, [cart])

  const updateQuantity = (productId: number, newQuantity: number) => {
    setCart((prevCart) => {
      const newCart = new Map(prevCart)
      const item = newCart.get(productId)

      if (!item) return prevCart

      if (newQuantity <= 0) {
        newCart.delete(productId)
      } else {
        // Make sure we don't exceed available stock
        const product = products.find((p) => p.id === productId)
        const maxQuantity = product ? product.stock : 0

        newCart.set(productId, {
          ...item,
          quantity: Math.min(newQuantity, maxQuantity),
        })
      }

      return newCart
    })
  }

  const removeItem = (productId: number) => {
    setCart((prevCart) => {
      const newCart = new Map(prevCart)
      newCart.delete(productId)
      return newCart
    })
  }

  const calculateTotal = () => {
    let total = 0
    cart.forEach((item) => {
      total += Number(item.product.price) * item.quantity
    })
    return total
  }

  const validateForm = () => {
    const errors: { [key: string]: string } = {}

    if (!buyerName.trim()) {
      errors.buyerName = "Name is required"
    }

    if (!buyerEmail.trim()) {
      errors.buyerEmail = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(buyerEmail)) {
      errors.buyerEmail = "Email is invalid"
    }

    if (!buyerPhone.trim()) {
      errors.buyerPhone = "Phone number is required"
    }

    if (!deliveryAddress.trim()) {
      errors.deliveryAddress = "Delivery address is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (cart.size === 0) {
      setError("Your cart is empty. Please add some products before placing an order.")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const orderItems = Array.from(cart.values()).map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }))

      const orderData = {
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        buyer_phone: buyerPhone,
        delivery_address: deliveryAddress,
        total_amount: calculateTotal(),
        items: orderItems,
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to place order")
      }

      const result = await response.json()

      // Clear cart after successful order
      setCart(new Map())
      localStorage.removeItem("cart")

      // Redirect to order confirmation page
      router.push(`/track?orderId=${result.id}`)
    } catch (err) {
      console.error("Error placing order:", err)
      setError(err instanceof Error ? err.message : "Failed to place order. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading cart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/products" className="text-green-700 hover:text-green-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Products
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-green-800 mb-6">Your Order</h1>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cart Items */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Cart Items</h2>

            {cart.size === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Your cart is empty</p>
                <Link
                  href="/products"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.from(cart.values()).map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden mr-4">
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
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="text-sm text-gray-500">${Number(item.product.price).toFixed(2)} each</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border rounded">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-3 py-1">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                          disabled={item.quantity >= item.product.stock}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.product.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="buyerName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="buyerName"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    formErrors.buyerName ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                />
                {formErrors.buyerName && <p className="text-red-500 text-sm mt-1">{formErrors.buyerName}</p>}
              </div>

              <div>
                <label htmlFor="buyerEmail" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="buyerEmail"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    formErrors.buyerEmail ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                />
                {formErrors.buyerEmail && <p className="text-red-500 text-sm mt-1">{formErrors.buyerEmail}</p>}
              </div>

              <div>
                <label htmlFor="buyerPhone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="text"
                  id="buyerPhone"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    formErrors.buyerPhone ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                />
                {formErrors.buyerPhone && <p className="text-red-500 text-sm mt-1">{formErrors.buyerPhone}</p>}
              </div>

              <div>
                <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700">
                  Delivery Address
                </label>
                <textarea
                  id="deliveryAddress"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  rows={3}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    formErrors.deliveryAddress ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                />
                {formErrors.deliveryAddress && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.deliveryAddress}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md mt-6 flex items-center justify-center"
                disabled={submitting || cart.size === 0}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  "Place Order"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
