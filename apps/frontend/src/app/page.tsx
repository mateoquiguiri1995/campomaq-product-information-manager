'use client'

import { useState, useEffect, useCallback } from 'react'

interface Product {
  _id: string
  product_id: number
  product_code: string
  product_name: string
  category_name: string
  brand_name: string
  price_cash: number
  link: string[]
  show_in_app: boolean
}

interface ApiResponse {
  success: boolean
  data: Product[]
  count: number
  error?: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInAppOnly, setShowInAppOnly] = useState(false)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  // Debounce search to avoid reloading on every character
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts()
    }, 300) // 300ms delay

    return () => clearTimeout(timeoutId)
  }, [searchTerm, showInAppOnly])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (searchTerm) {
        params.append('search', searchTerm)
      }
      if (showInAppOnly) {
        params.append('show_in_app', 'true')
      }
      params.append('limit', '100') // Limit to 100 products
      
      const url = `${API_BASE_URL}/products?${params.toString()}`
      const response = await fetch(url)
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setProducts(data.data)
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch products')
      }
    } catch (err) {
      setError('Failed to connect to the server')
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Remove the product from the list
        setProducts(products.filter(p => p.product_id !== productId))
      } else {
        alert(data.error || 'Failed to delete product')
      }
    } catch (err) {
      alert('Failed to delete product')
      console.error('Error deleting product:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchProducts}
                className="btn-primary text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black">Products</h1>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by name, code, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showInAppOnly}
              onChange={(e) => setShowInAppOnly(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Show active products only
            </span>
          </label>
        </div>
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Has Images
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    {searchTerm ? 'No products found matching your search.' : 'No products found.'}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <div className="flex justify-center">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          product.show_in_app
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            product.show_in_app ? 'bg-emerald-500' : 'bg-gray-400'
                          }`}></div>
                          {product.show_in_app ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.product_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.product_code ? product.product_code.substring(0, 15) + (product.product_code.length > 15 ? '...' : '') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      <div className="truncate" title={product.product_name}>
                        {product.product_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.brand_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.price_cash?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.link && product.link.length > 0 && product.link.some(link => link && link.trim() !== '')
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.link && product.link.length > 0 && product.link.some(link => link && link.trim() !== '') ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <a
                        href={`/products/${product.product_id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </a>
                      <a
                        href={`/products/${product.product_id}/edit`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Edit
                      </a>
                      <button
                        onClick={() => handleDelete(product.product_id)}
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

      {products.length > 0 && (
        <div className="text-sm text-gray-500">
          Showing {products.length} product{products.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}