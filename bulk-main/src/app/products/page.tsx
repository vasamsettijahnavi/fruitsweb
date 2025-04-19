"use client"

import { useState, useEffect } from "react"
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<"database" | "fallback" | null>(null)
  const [cart, setCart] = useState<Map<number, CartItem>>(new Map())

  // Fallback data in case the API fails
  const getFallbackProducts = () => {
    return [
      {
        id: 1,
        name: "Organic Apples",
        description: "Fresh organic apples from local farms",
        price: 3.99,
        image_url: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb",
        category: "Fruits",
        stock: 100,
      },
      {
        id: 2,
        name: "Bananas",
        description: "Ripe yellow bananas, perfect for smoothies",
        price: 2.49,
        image_url: "https://images.unsplash.com/photo-1543218024-57a70143c369",
        category: "Fruits",
        stock: 150,
      },
      {
        id: 6,
        name: "Fresh Carrots",
        description: "Locally grown carrots, perfect for salads and cooking",
        price: 2.49,
        image_url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37",
        category: "Vegetables",
        stock: 150,
      },
      {
        id: 7,
        name: "Broccoli",
        description: "Fresh green broccoli florets",
        price: 2.99,
        image_url: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc",
        category: "Vegetables",
        stock: 100,
      },
    ]
  }

  useEffect(() => {
    async function fetchProducts() {
      try {
        console.log("Fetching products from API...")

        // Use try-catch to handle fetch errors
        let response
        try {
          response = await fetch("/api/products", {
            // Add cache: 'no-store' to prevent caching
            cache: "no-store",
            // Add a timeout
            signal: AbortSignal.timeout(5000), // 5 second timeout
          })
        } catch (fetchError) {
          console.error("Fetch error:", fetchError)
          throw new Error(
            `Network error: ${fetchError instanceof Error ? fetchError.message : "Failed to connect to server"}`,
          )
        }

        // Check the data source from headers
        const source = response.headers.get("X-Data-Source")
        if (source) {
          setDataSource(source as "database" | "fallback")
        }

        // Check if response is OK
        if (!response.ok) {
          console.error("API response not OK:", response.status)
          throw new Error(`Server error: ${response.status} ${response.statusText}`)
        }

        // Check content type to ensure it's JSON
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          console.error("Response is not JSON:", contentType)
          throw new Error("Server returned non-JSON response")
        }

        // Parse JSON with error handling
        let data
        try {
          data = await response.json()
        } catch (jsonError) {
          console.error("JSON parse error:", jsonError)
          throw new Error(
            `Invalid JSON response: ${jsonError instanceof Error ? jsonError.message : "Failed to parse JSON"}`,
          )
        }

        console.log(`Received ${data.length} products from API`)

        if (!Array.isArray(data)) {
          console.error("API did not return an array:", data)
          throw new Error("Invalid response format from API")
        }

        setProducts(data)
      } catch (err) {
        console.error("Error in fetchProducts:", err)
        setError(`Using sample product data. ${err instanceof Error ? err.message : ""}`)
        setProducts(getFallbackProducts())
        setDataSource("fallback")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()

    // Load cart from localStorage
    try {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        const newCart = new Map()
        Object.entries(parsedCart).forEach(([id, item]) => {
          newCart.set(Number(id), item as CartItem)
        })
        setCart(newCart)
      }
    } catch (e) {
      console.error("Failed to parse saved cart", e)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      const cartObj = Object.fromEntries(cart)
      localStorage.setItem("cart", JSON.stringify(cartObj))
    } catch (e) {
      console.error("Failed to save cart to localStorage", e)
    }
  }, [cart])

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const newCart = new Map(prevCart)
      const existing = newCart.get(product.id)

      if (existing) {
        newCart.set(product.id, {
          product,
          quantity: existing.quantity + 1,
        })
      } else {
        newCart.set(product.id, { product, quantity: 1 })
      }

      return newCart
    })
  }

  const cartItemsCount = Array.from(cart.values()).reduce((total, item) => total + item.quantity, 0)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
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

          <Link
            href="/order"
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            Cart ({cartItemsCount})
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-green-800 mb-6">Our Fresh Products</h1>

        {dataSource === "fallback" && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
            <p className="font-bold">Note</p>
            <p>We're experiencing some technical difficulties with our database. Showing sample products instead.</p>
            {error && <p className="text-sm mt-2">{error}</p>}
          </div>
        )}

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Fruits</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products
              .filter((product) => product.category === "Fruits")
              .map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                  <div className="h-48 bg-gray-200 relative">
                    {product.image_url ? (
                      <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        No image available
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-xl font-semibold mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-4 flex-1">
                      {product.description || "No description available"}
                    </p>

                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-lg font-bold text-green-700">${Number(product.price).toFixed(2)}</span>
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock <= 0}
                        className={`py-1 px-3 rounded-md ${
                          product.stock > 0
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-gray-300 cursor-not-allowed text-gray-500"
                        }`}
                      >
                        {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                      </button>
                    </div>

                    <p className="text-sm text-gray-500 mt-2">
                      {product.stock > 0 ? `${product.stock} in stock` : "Currently unavailable"}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Vegetables</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products
              .filter((product) => product.category === "Vegetables")
              .map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                  <div className="h-48 bg-gray-200 relative">
                    {product.image_url ? (
                      <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        No image available
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-xl font-semibold mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-4 flex-1">
                      {product.description || "No description available"}
                    </p>

                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-lg font-bold text-green-700">${Number(product.price).toFixed(2)}</span>
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock <= 0}
                        className={`py-1 px-3 rounded-md ${
                          product.stock > 0
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-gray-300 cursor-not-allowed text-gray-500"
                        }`}
                      >
                        {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                      </button>
                    </div>

                    <p className="text-sm text-gray-500 mt-2">
                      {product.stock > 0 ? `${product.stock} in stock` : "Currently unavailable"}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
