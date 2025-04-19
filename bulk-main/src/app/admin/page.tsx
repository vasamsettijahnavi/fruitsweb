"use client"

import type React from "react"

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

type Order = {
  id: number
  buyer_name: string
  buyer_email: string
  buyer_phone: string
  delivery_address: string
  total_amount: number
  status: "PENDING" | "IN_PROGRESS" | "DELIVERED" | "CANCELLED"
  created_at: string
  items: any[]
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("products")
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<{
    products: "loading" | "success" | "error"
    orders: "loading" | "success" | "error"
  }>({
    products: "loading",
    orders: "loading",
  })

  // Product form state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [productName, setProductName] = useState("")
  const [productDescription, setProductDescription] = useState("")
  const [productPrice, setProductPrice] = useState("")
  const [productImageUrl, setProductImageUrl] = useState("")
  const [productCategory, setProductCategory] = useState("")
  const [productStock, setProductStock] = useState("")
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchOrders()
  }, [])

  useEffect(() => {
    if (editingProduct) {
      setProductName(editingProduct.name)
      setProductDescription(editingProduct.description || "")
      setProductPrice(editingProduct.price.toString())
      setProductImageUrl(editingProduct.image_url || "")
      setProductCategory(editingProduct.category)
      setProductStock(editingProduct.stock.toString())
    }
  }, [editingProduct])

  // Get fallback products
  const getFallbackProducts = (): Product[] => {
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

  // Get fallback orders
  const getFallbackOrders = (): Order[] => {
    return [
      {
        id: 1,
        buyer_name: "John Doe",
        buyer_email: "john@example.com",
        buyer_phone: "555-123-4567",
        delivery_address: "123 Main St, Anytown, USA",
        total_amount: 25.97,
        status: "PENDING",
        created_at: new Date().toISOString(),
        items: [],
      },
      {
        id: 2,
        buyer_name: "Jane Smith",
        buyer_email: "jane@example.com",
        buyer_phone: "555-987-6543",
        delivery_address: "456 Oak Ave, Somewhere, USA",
        total_amount: 18.45,
        status: "DELIVERED",
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        items: [],
      },
    ]
  }

  const fetchProducts = async () => {
    setApiStatus((prev) => ({ ...prev, products: "loading" }))
    try {
      console.log("Admin: Fetching products from API...")
      const response = await fetch("/api/products")

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Admin: API response not OK:", response.status, errorData)
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`Admin: Received ${data.length} products from API`)

      if (!Array.isArray(data)) {
        console.error("Admin: API did not return an array:", data)
        throw new Error("Invalid response format from API")
      }

      setProducts(data)
      setApiStatus((prev) => ({ ...prev, products: "success" }))
    } catch (err) {
      console.error("Admin: Error fetching products:", err)
      setError(`Failed to load products. Using sample data instead. ${err instanceof Error ? err.message : ""}`)
      setProducts(getFallbackProducts())
      setApiStatus((prev) => ({ ...prev, products: "error" }))
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    setApiStatus((prev) => ({ ...prev, orders: "loading" }))
    try {
      console.log("Admin: Fetching orders from API...")
      const response = await fetch("/api/orders")

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Admin: API response not OK:", response.status, errorData)
        throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`Admin: Received ${data.length} orders from API`)

      if (!Array.isArray(data)) {
        console.error("Admin: API did not return an array:", data)
        throw new Error("Invalid response format from API")
      }

      setOrders(data)
      setApiStatus((prev) => ({ ...prev, orders: "success" }))
    } catch (err) {
      console.error("Admin: Error fetching orders:", err)
      setOrders(getFallbackOrders())
      setApiStatus((prev) => ({ ...prev, orders: "error" }))
    }
  }

  const handleAddProduct = () => {
    setEditingProduct(null)
    setIsAddingProduct(true)
    resetProductForm()
  }

  const handleEditProduct = (product: Product) => {
    setIsAddingProduct(false)
    setEditingProduct(product)
  }

  const resetProductForm = () => {
    setProductName("")
    setProductDescription("")
    setProductPrice("")
    setProductImageUrl("")
    setProductCategory("")
    setProductStock("")
    setFormErrors({})
  }

  const validateProductForm = () => {
    const errors: { [key: string]: string } = {}

    if (!productName.trim()) {
      errors.name = "Product name is required"
    }

    if (!productPrice.trim()) {
      errors.price = "Price is required"
    } else if (isNaN(Number(productPrice)) || Number(productPrice) <= 0) {
      errors.price = "Price must be a positive number"
    }

    if (!productCategory.trim()) {
      errors.category = "Category is required"
    }

    if (productStock.trim() && (isNaN(Number(productStock)) || Number(productStock) < 0)) {
      errors.stock = "Stock must be a non-negative number"
    }

    if (productImageUrl.trim() && !productImageUrl.match(/^https?:\/\/.+/)) {
      errors.imageUrl = "Image URL must be a valid URL"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateProductForm()) {
      return
    }

    setSubmitting(true)

    const productData = {
      name: productName,
      description: productDescription || null,
      price: Number(productPrice),
      image_url: productImageUrl || null,
      category: productCategory,
      stock: productStock ? Number(productStock) : 0,
    }

    try {
      if (editingProduct) {
        // Update existing product
        const response = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        })

        if (!response.ok) {
          throw new Error("Failed to update product")
        }

        const updatedProduct = await response.json()

        // Update the product in the list
        setProducts((prevProducts) =>
          prevProducts.map((product) => (product.id === editingProduct.id ? updatedProduct : product)),
        )

        setEditingProduct(null)
      } else {
        // Create new product
        const response = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        })

        if (!response.ok) {
          throw new Error("Failed to create product")
        }

        const newProduct = await response.json()

        // Add the new product to the list
        setProducts((prevProducts) => [...prevProducts, newProduct])

        setIsAddingProduct(false)
      }

      // Reset the form
      resetProductForm()
    } catch (err) {
      console.error("Error saving product:", err)
      setError(err instanceof Error ? err.message : "Failed to save product. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete product")
      }

      // Remove the product from the list
      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== productId))
    } catch (err) {
      console.error("Error deleting product:", err)
      setError(err instanceof Error ? err.message : "Failed to delete product. Please try again.")
    }
  }

  const updateOrderStatus = async (orderId: number, status: Order["status"]) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update order status")
      }

      // Update the order in the list
      setOrders((prevOrders) => prevOrders.map((order) => (order.id === orderId ? { ...order, status } : order)))
    } catch (err) {
      console.error("Error updating order status:", err)
      setError(err instanceof Error ? err.message : "Failed to update order status. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
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

          <button
            onClick={() => {
              fetchProducts()
              fetchOrders()
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Refresh Data
          </button>
        </div>

        <h1 className="text-3xl font-bold text-green-800 mb-6">Admin Dashboard</h1>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        {(apiStatus.products === "error" || apiStatus.orders === "error") && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
            <p className="font-bold">Note</p>
            <p>
              We're experiencing some technical difficulties with the database connection. Some features may be limited.
            </p>
            <p className="text-sm mt-2">
              {apiStatus.products === "error" && "• Product data is using sample data"}
              {apiStatus.orders === "error" && "• Order data is using sample data"}
            </p>
          </div>
        )}

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab("products")}
                className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                  activeTab === "products"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                  activeTab === "orders"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Orders
              </button>
            </nav>
          </div>
        </div>

        {activeTab === "products" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Manage Products</h2>
              <button
                onClick={handleAddProduct}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add Product
              </button>
            </div>

            {(isAddingProduct || editingProduct) && (
              <div className="mb-8 border p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">{editingProduct ? "Edit Product" : "Add New Product"}</h3>

                <form onSubmit={handleSubmitProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
                        Product Name
                      </label>
                      <input
                        type="text"
                        id="productName"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className={`mt-1 block w-full px-3 py-2 border ${
                          formErrors.name ? "border-red-500" : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                      />
                      {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="productCategory" className="block text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <select
                        id="productCategory"
                        value={productCategory}
                        onChange={(e) => setProductCategory(e.target.value)}
                        className={`mt-1 block w-full px-3 py-2 border ${
                          formErrors.category ? "border-red-500" : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                      >
                        <option value="">Select a category</option>
                        <option value="Fruits">Fruits</option>
                        <option value="Vegetables">Vegetables</option>
                      </select>
                      {formErrors.category && <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>}
                    </div>

                    <div>
                      <label htmlFor="productPrice" className="block text-sm font-medium text-gray-700">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        id="productPrice"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        step="0.01"
                        min="0"
                        className={`mt-1 block w-full px-3 py-2 border ${
                          formErrors.price ? "border-red-500" : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                      />
                      {formErrors.price && <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>}
                    </div>

                    <div>
                      <label htmlFor="productStock" className="block text-sm font-medium text-gray-700">
                        Stock
                      </label>
                      <input
                        type="number"
                        id="productStock"
                        value={productStock}
                        onChange={(e) => setProductStock(e.target.value)}
                        min="0"
                        className={`mt-1 block w-full px-3 py-2 border ${
                          formErrors.stock ? "border-red-500" : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                      />
                      {formErrors.stock && <p className="text-red-500 text-sm mt-1">{formErrors.stock}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="productImageUrl" className="block text-sm font-medium text-gray-700">
                        Image URL
                      </label>
                      <input
                        type="text"
                        id="productImageUrl"
                        value={productImageUrl}
                        onChange={(e) => setProductImageUrl(e.target.value)}
                        className={`mt-1 block w-full px-3 py-2 border ${
                          formErrors.imageUrl ? "border-red-500" : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                      />
                      {formErrors.imageUrl && <p className="text-red-500 text-sm mt-1">{formErrors.imageUrl}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="productDescription"
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingProduct(false)
                        setEditingProduct(null)
                        resetProductForm()
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Saving...
                        </div>
                      ) : (
                        "Save Product"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Stock
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        No products found. Add your first product!
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {product.image_url ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={product.image_url || "/placeholder.svg"}
                                  alt=""
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                                  No img
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${Number(product.price).toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.stock}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Manage Orders</h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Order ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Customer
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Total
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.buyer_name}</div>
                          <div className="text-sm text-gray-500">{order.buyer_email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(order.created_at).toLocaleDateString()}</div>
                          <div className="text-sm text-gray-500">{new Date(order.created_at).toLocaleTimeString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${Number(order.total_amount).toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "IN_PROGRESS"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "DELIVERED"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/track?orderId=${order.id}`}
                            target="_blank"
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            View
                          </Link>

                          {order.status === "PENDING" && (
                            <button
                              onClick={() => updateOrderStatus(order.id, "IN_PROGRESS")}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Start Delivery
                            </button>
                          )}

                          {order.status === "IN_PROGRESS" && (
                            <button
                              onClick={() => updateOrderStatus(order.id, "DELIVERED")}
                              className="text-green-600 hover:text-green-900 mr-4"
                            >
                              Mark Delivered
                            </button>
                          )}

                          {(order.status === "PENDING" || order.status === "IN_PROGRESS") && (
                            <button
                              onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                              className="text-red-600 hover:text-red-900"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
