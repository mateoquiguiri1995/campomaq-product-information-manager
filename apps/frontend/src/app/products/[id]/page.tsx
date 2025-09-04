'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Product {
  _id: string
  product_code: string
  main_boost: number
  low_value_flag: number
  popularity: number
  product_id: number
  product_name: string
  category_name: string
  brand_name: string
  brand_logo: string
  price_cash: number
  description: string
  link: string[]
  show_in_app: boolean
  new_product: boolean
  discount: string
  is_spare_part: boolean
  created_at: string
  updated_at: string
}

interface ApiResponse {
  success: boolean
  data: Product
  error?: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/products/${productId}`)
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setProduct(data.data)
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch product')
      }
    } catch (err) {
      setError('Failed to connect to the server')
      console.error('Error fetching product:', err)
    } finally {
      setLoading(false)
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
            <div className="mt-4 space-x-2">
              <button
                onClick={fetchProduct}
                className="btn-primary text-sm"
              >
                Try Again
              </button>
              <a
                href="/"
                className="btn-secondary text-sm"
              >
                Back to Products
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
        <p className="mt-2 text-gray-600">The product you're looking for doesn't exist.</p>
        <div className="mt-4">
          <a href="/" className="btn-primary">
            Back to Products
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <a href="/" className="text-gray-400 hover:text-gray-500">
                  Products
                </a>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li>
                <span className="text-gray-900 font-medium">
                  {product.product_name}
                </span>
              </li>
            </ol>
          </nav>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Product Details
          </h1>
        </div>
        <div className="flex space-x-3">
          <a
            href={`/products/${product.product_id}/edit`}
            className="btn-primary"
          >
            Edit Product
          </a>
          <a
            href="/"
            className="btn-secondary"
          >
            Back to List
          </a>
        </div>
      </div>

      {/* Product Images */}
      {product.link && product.link.length > 0 && product.link.some(link => link && link.trim() !== '') && (
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Product Images</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {product.link.filter(link => link && link.trim() !== '').map((imageUrl, index) => (
              <div key={index} className="relative">
                <img
                  src={imageUrl}
                  alt={`${product.product_name} - Image ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                    target.alt = 'Image not found';
                  }}
                />
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Main
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Details Card */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Basic Information
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Product ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.product_id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Product Code</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.product_code || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Product Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.product_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.category_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Brand</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.brand_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Brand Logo</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.brand_logo || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Price</dt>
                <dd className="mt-1 text-sm text-gray-900 font-semibold">
                  ${product.price_cash?.toFixed(2) || '0.00'}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              System Information
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Main Boost</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.main_boost || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Low Value Flag</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.low_value_flag || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Popularity</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.popularity || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Discount</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.discount || 'None'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(product.created_at).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(product.updated_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Status & Flags
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Show in App</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.show_in_app
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.show_in_app ? 'Yes' : 'No'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">New Product</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.new_product
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.new_product ? 'Yes' : 'No'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Is Spare Part</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.is_spare_part
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.is_spare_part ? 'Yes' : 'No'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Has Images</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.link && product.link.length > 0 && product.link.some(link => link && link.trim() !== '')
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.link && product.link.length > 0 && product.link.some(link => link && link.trim() !== '') ? 'Yes' : 'No'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
          <p className="text-sm text-gray-900 leading-relaxed">
            {product.description || 'No description provided'}
          </p>
        </div>
      </div>
    </div>
  )
}