'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

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
}

interface ApiResponse {
  success: boolean
  data: Product
  error?: string
  message?: string
}

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    product_name: '',
    category_name: '',
    brand_name: '',
    brand_logo: '',
    description: '',
    link: [''],
    show_in_app: true,
    new_product: false,
    discount: '',
    is_spare_part: false
  })

  const categories = [
    'Motocultores', 'Mini tractores cortacésped', 'Motoazadas', 'Accesorios agrícolas',
    'Cortacesped', 'Cortasetos', 'Desbrozadoras', 'Motosierras', 'Sopladoras',
    'Accesorios bosque y jardín', 'Discos fumigación', 'Fumigadoras motorizadas',
    'Fumigadoras manuales', 'Espolvoreadoras', 'Accesorios fumigación',
    'Aceites 2 Tiempos', 'Aceites 4 Tiempos', 'Grasas', 'Bombas de caudal',
    'Bombas de presión', 'Accesorios riego', 'Motores', 'Generadores', 'Tijeras', 'Otros'
  ]

  const brands = [
    'ANNOVI REBERBERI', 'CASAMOTO', 'DUCATI', 'ECHO', 'HUSQVARNA',
    'MARUYAMA', 'STHIL', 'WHALE BEST', 'TEMCO (PIM only)', 'OTROS (PIM only)'
  ]

  const brandLogos = [
    '/images/brands/annovi-reberberi.png', '/images/brands/casamoto.png',
    '/images/brands/ducati.png', '/images/brands/echo.png', '/images/brands/husqvarna.png',
    '/images/brands/maruyama.png', '/images/brands/mitsubishi.png', '/images/brands/oleo-mac.png',
    '/images/brands/sthil.png', '/images/brands/shindaiwa.png', '/images/brands/whale-best.png',
    '/images/brands/temco.png', '/images/brands/placeholder.png'
  ]

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
        setFormData({
          product_name: data.data.product_name,
          category_name: data.data.category_name,
          brand_name: data.data.brand_name,
          brand_logo: data.data.brand_logo || '',
          description: data.data.description || '',
          link: data.data.link || [''],
          show_in_app: data.data.show_in_app,
          new_product: data.data.new_product || false,
          discount: data.data.discount || '',
          is_spare_part: data.data.is_spare_part || false
        })
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...formData.link]
    newLinks[index] = value
    setFormData(prev => ({ ...prev, link: newLinks }))
  }

  const addLink = () => {
    setFormData(prev => ({ ...prev, link: [...prev.link, ''] }))
  }

  const removeLink = (index: number) => {
    if (formData.link.length > 1) {
      const newLinks = formData.link.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, link: newLinks }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.product_name.trim() || !formData.category_name.trim() ||
        !formData.brand_name.trim() || !formData.brand_logo.trim() ||
        !formData.description.trim()) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      setError(null)
      
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_name: formData.product_name.trim(),
          category_name: formData.category_name.trim(),
          brand_name: formData.brand_name.trim(),
          brand_logo: formData.brand_logo,
          description: formData.description.trim(),
          link: formData.link.filter(link => link.trim() !== ''),
          show_in_app: formData.show_in_app,
          new_product: formData.new_product,
          discount: formData.discount.trim() || null,
          is_spare_part: formData.is_spare_part
        }),
      })

      const data: ApiResponse = await response.json()

      if (data.success) {
        // Stay on page and show success message
        setSuccess('Product updated successfully!')
        setError(null)
        // Refresh product data
        fetchProduct()
      } else {
        setError(data.error || 'Failed to update product')
        setSuccess(null)
      }
    } catch (err) {
      setError('Failed to update product')
      console.error('Error updating product:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
        <p className="mt-2 text-gray-600">The product you're trying to edit doesn't exist.</p>
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
                <a 
                  href={`/products/${product.product_id}`}
                  className="text-gray-400 hover:text-gray-500"
                >
                  {product.product_name}
                </a>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li>
                <span className="text-gray-900 font-medium">Edit</span>
              </li>
            </ol>
          </nav>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Edit Product
          </h1>
        </div>
        <div className="flex space-x-3">
          <a
            href={`/products/${product.product_id}`}
            className="btn-secondary"
          >
            Cancel
          </a>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{success}</p>
                <p className="mt-1">
                  <a
                    href={`/products/${productId}`}
                    className="text-green-600 hover:text-green-800 underline"
                  >
                    View product details
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Read-only fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Code (read only)</label>
              <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                {product?.product_code || 'N/A'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Product ID (read only)</label>
              <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                {product?.product_id || 'N/A'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Main Boost (read only)</label>
              <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                {product?.main_boost || 'N/A'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Popularity (read only)</label>
              <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                {product?.popularity || 'N/A'}
              </div>
            </div>
          </div>

          {/* Editable fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="product_name" className="block text-sm font-medium text-gray-700">
                Product Name *
              </label>
              <input
                type="text"
                id="product_name"
                name="product_name"
                value={formData.product_name}
                onChange={handleInputChange}
                required
                className="mt-1 input-field"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label htmlFor="category_name" className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                id="category_name"
                name="category_name"
                value={formData.category_name}
                onChange={handleInputChange}
                required
                className="mt-1 input-field"
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="brand_name" className="block text-sm font-medium text-gray-700">
                Brand *
              </label>
              <select
                id="brand_name"
                name="brand_name"
                value={formData.brand_name}
                onChange={handleInputChange}
                required
                className="mt-1 input-field"
              >
                <option value="">Select brand</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="brand_logo" className="block text-sm font-medium text-gray-700">
                Brand Logo *
              </label>
              <select
                id="brand_logo"
                name="brand_logo"
                value={formData.brand_logo}
                onChange={handleInputChange}
                required
                className="mt-1 input-field"
              >
                <option value="">Select brand logo</option>
                {brandLogos.map(logo => (
                  <option key={logo} value={logo}>{logo}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="discount" className="block text-sm font-medium text-gray-700">
                Discount (optional)
              </label>
              <input
                type="text"
                id="discount"
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                className="mt-1 input-field"
                placeholder="e.g., -5%"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Price (read only)</label>
              <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                ${product?.price_cash?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="mt-1 input-field"
              placeholder="Enter product description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images (optional)
            </label>
            {formData.link.map((link, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={link}
                  onChange={(e) => handleLinkChange(index, e.target.value)}
                  className="flex-1 input-field"
                  placeholder="Enter image URL"
                />
                {formData.link.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLink(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addLink}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              + Add another image
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="show_in_app"
                name="show_in_app"
                checked={formData.show_in_app}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="show_in_app" className="ml-2 block text-sm text-gray-900">
                Show in app *
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="new_product"
                name="new_product"
                checked={formData.new_product}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="new_product" className="ml-2 block text-sm text-gray-900">
                New product
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_spare_part"
                name="is_spare_part"
                checked={formData.is_spare_part}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_spare_part" className="ml-2 block text-sm text-gray-900">
                Is spare part *
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <a
              href={`/products/${product.product_id}`}
              className="btn-secondary"
            >
              Cancel
            </a>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}