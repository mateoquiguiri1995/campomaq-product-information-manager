import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Campomaq Product Information Manager',
  description: 'Campomaq Catalog Product Manager',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-black shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-3xl font-semibold text-yellow-400">
                  Campomaq Product Manager
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <a
                  href="/"
                  className="text-yellow-400 hover:text-yellow-300 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Products
                </a>
                <a
                  href="/products/create"
                  className="btn-primary text-sm"
                >
                  Add Product
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  )
}