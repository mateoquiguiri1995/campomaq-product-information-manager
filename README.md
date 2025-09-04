# Product Information Manager

A full-stack product information management system built with Flask (backend) and Next.js (frontend).

## Features

- **Product Management**: Create, read, update, and soft delete products
- **Search Functionality**: Search products by name
- **Responsive Design**: Modern UI built with Tailwind CSS
- **MongoDB Integration**: Persistent data storage
- **RESTful API**: Clean API endpoints for all operations

## Project Structure

```
campomaq-product-information-manager/
├── apps/
│   ├── backend/          # Flask API server
│   │   ├── app.py        # Main Flask application
│   │   ├── requirements.txt
│   │   └── .env.example
│   └── frontend/         # Next.js React application
│       ├── src/
│       │   └── app/      # App router pages
│       ├── package.json
│       ├── postcss.config.js
│       └── .env.local.example
└── README.md
```

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd apps/backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create environment file:
   ```bash
   cp .env.example .env
   ```

5. Update `.env` with your MongoDB connection string:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
   DB_NAME=products_db
   COLLECTION_NAME=catalog
   FLASK_ENV=development
   PORT=5000
   ```

6. Run the Flask server:
   ```bash
   python app.py
   ```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd apps/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.local.example .env.local
   ```

4. Update `.env.local` if needed:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NODE_ENV=development
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Products

- `GET /products` - Get all products (with optional search)
- `GET /products/<id>` - Get a single product
- `POST /products` - Create a new product
- `PUT /products/<id>` - Update a product
- `DELETE /products/<id>` - Soft delete a product (set show_in_app=false)

### Health Check

- `GET /health` - Health check endpoint

## Product Schema

```json
{
  "product_id": 1,
  "product_name": "Sample Product",
  "category_name": "Electronics",
  "brand_name": "Sample Brand",
  "price_cash": 99.99,
  "description": "Product description",
  "show_in_app": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## Deployment

### Backend (Azure Web App)

1. Update `.env` with production MongoDB URI
2. Set `FLASK_ENV=production`
3. Deploy to Azure Web App

### Frontend (Azure Static Web App)

1. Update `.env.local` with production API URL
2. Build the application: `npm run build`
3. Deploy to Azure Static Web App

## Development

### Adding New Features

1. Backend changes go in `apps/backend/app.py`
2. Frontend pages go in `apps/frontend/src/app/`
3. Styles are configured with Tailwind CSS v4+ (no config file needed)

### Database

The application uses MongoDB with the following collections:
- `catalog` - Stores product information

Products are soft-deleted by setting `show_in_app: false` rather than being removed from the database.

## Technologies Used

### Backend
- **Flask** - Web framework
- **pymongo** - MongoDB driver
- **python-dotenv** - Environment variable management
- **flask-cors** - CORS handling

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4+** - Modern utility-first CSS framework

## License

This project is licensed under the MIT License.