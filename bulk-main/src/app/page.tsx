import Link from "next/link"

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-4">
      <div className="max-w-6xl mx-auto pt-12 pb-24">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-green-800 mb-4">Fresh Harvest</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Order fresh fruits and vegetables directly from local farmers to your doorstep
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Browse Products Card */}
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Browse Products</h2>
            <p className="text-gray-600 mb-6">Explore our selection of fresh fruits and vegetables</p>
            <Link
              href="/products"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              View Catalog
            </Link>
          </div>

          {/* Place Order Card */}
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Place an Order</h2>
            <p className="text-gray-600 mb-6">Select your items and have them delivered to your home</p>
            <Link
              href="/order"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              Order Now
            </Link>
          </div>

          {/* Track Order Card */}
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Track Your Order</h2>
            <p className="text-gray-600 mb-6">Check the status of your existing orders</p>
            <Link
              href="/track"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              Track Order
            </Link>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/admin"
            className="inline-block border border-green-600 text-green-600 hover:bg-green-50 font-medium py-2 px-6 rounded-md transition-colors"
          >
            Admin Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
