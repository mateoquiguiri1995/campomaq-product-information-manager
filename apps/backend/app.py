import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from bson.errors import InvalidId
from dotenv import load_dotenv
import datetime, math

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, origins="*")

# MongoDB configuration
MONGO_URI = os.getenv('MONGO_URI')
DB_NAME = os.getenv('DB_NAME', 'products_db')
COLLECTION_NAME = os.getenv('COLLECTION_NAME', 'catalog')

# Initialize MongoDB client
try:
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    # Test connection
    client.admin.command('ping')
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    client = None

def serialize_product(product):
    """Convert MongoDB document to JSON serializable format"""
    if not product:
        return None

    def fix_value(value):
        if isinstance(value, ObjectId):
            return str(value)
        elif isinstance(value, float):
            # Replace NaN or inf with None (or 0 if you prefer)
            if math.isnan(value) or math.isinf(value):
                return None
            return value
        elif isinstance(value, list):
            return [fix_value(v) for v in value]
        elif isinstance(value, dict):
            return {k: fix_value(v) for k, v in value.items()}
        else:
            return value

    return {k: fix_value(v) for k, v in product.items()}

def get_next_product_id():
    """Generate next product ID"""
    last_product = collection.find_one(sort=[("product_id", -1)])
    if last_product and 'product_id' in last_product:
        return last_product['product_id'] + 1
    return 1


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "timestamp": datetime.datetime.utcnow().isoformat()})

@app.route('/products', methods=['GET'])
def get_products():
    """Get products with pagination and filtering"""
    try:
        # Base query
        query = {}
        
        # Filter by show_in_app if checkbox is provided
        show_in_app_filter = request.args.get('show_in_app')
        if show_in_app_filter == 'true':
            query["show_in_app"] = True
        # elif show_in_app_filter == 'false':
        #     query["show_in_app"] = False
        # else:
        #     # Default: only show products that should be shown in app
        #     query["show_in_app"] = {"$ne": False}
        
        # Get search parameters
        search = request.args.get('search', '').strip()
        if search:
            # Search in product_name, product_code, or product_id
            search_conditions = [
                {"product_name": {"$regex": search, "$options": "i"}}
            ]
            
            # Add product_code search if field exists
            search_conditions.append({"product_code": {"$regex": search, "$options": "i"}})
            
            # If search is numeric, also search by product_id
            if search.isdigit():
                search_conditions.append({"product_id": int(search)})
            
            query["$or"] = search_conditions
        
        # Pagination - limit to 100 products max
        limit = min(int(request.args.get('limit', 100)), 100)
        skip = int(request.args.get('skip', 0))
        
        products = list(collection.find(
            query,
            {
                "product_id": 1,
                "product_code": 1,
                "product_name": 1,
                "category_name": 1,
                "brand_name": 1,
                "price_cash": 1,
                "link": 1,
                "show_in_app": 1
            }
        ).sort("product_id", 1).skip(skip).limit(limit))
        
        # Serialize products
        serialized_products = [serialize_product(product) for product in products]
        
        # Get total count for pagination info
        total_count = collection.count_documents(query)
        
        return jsonify({
            "success": True,
            "data": serialized_products,
            "count": len(serialized_products),
            "total": total_count,
            "limit": limit,
            "skip": skip
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/products/<product_id>', methods=['GET'])
def get_product(product_id):
    """Get a single product by ID (all fields)"""
    try:
        # Try to convert to int for product_id search
        try:
            pid = int(product_id)
            print("start",pid,"finish")
            product = collection.find_one({"product_id": pid})
        except ValueError:
            # If not a valid int, try ObjectId
            try:
                product = collection.find_one({"_id": ObjectId(product_id)})
            except InvalidId:
                return jsonify({
                    "success": False,
                    "error": "Invalid product ID format"
                }), 400
        
        if not product:
            return jsonify({
                "success": False,
                "error": "Product not found"
            }), 404
        
        return jsonify({
            "success": True,
            "data": serialize_product(product)
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/products', methods=['POST'])
def create_product():
    """Create a new product"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided"
            }), 400
        
        # Validate required fields
        required_fields = ['product_code', 'product_name', 'category_name', 'brand_name', 'brand_logo', 'description']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({
                    "success": False,
                    "error": f"Missing required field: {field}"
                }), 400
        
        # Create new product document
        new_product = {
            "product_id": get_next_product_id(),
            "product_code": data['product_code'],
            "main_boost": data.get('main_boost', 1),
            "low_value_flag": data.get('low_value_flag', 0),
            "popularity": data.get('popularity', 0),
            "product_name": data['product_name'],
            "category_name": data['category_name'],
            "brand_name": data['brand_name'],
            "brand_logo": data['brand_logo'],
            "price_cash": data.get('price_cash', 0),
            "description": data['description'],
            "link": data.get('link', []),
            "show_in_app": data.get('show_in_app', True),
            "new_product": data.get('new_product', False),
            "discount": data.get('discount'),
            "is_spare_part": data.get('is_spare_part', False),
            "created_at": datetime.datetime.utcnow(),
            "updated_at": datetime.datetime.utcnow()
        }
        
        # Insert product
        result = collection.insert_one(new_product)
        
        # Get the created product
        created_product = collection.find_one({"_id": result.inserted_id})
        
        return jsonify({
            "success": True,
            "data": serialize_product(created_product),
            "message": "Product created successfully"
        }), 201
    
    except ValueError as e:
        return jsonify({
            "success": False,
            "error": "Invalid data format"
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/products/<product_id>', methods=['PUT'])
def update_product(product_id):
    """Update an existing product"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided"
            }), 400
        
        # Try to find product by product_id first
        try:
            pid = int(product_id)
            product = collection.find_one({"product_id": pid})
        except ValueError:
            # If not a valid int, try ObjectId
            try:
                product = collection.find_one({"_id": ObjectId(product_id)})
            except InvalidId:
                return jsonify({
                    "success": False,
                    "error": "Invalid product ID format"
                }), 400
        
        if not product:
            return jsonify({
                "success": False,
                "error": "Product not found"
            }), 404
        
        # Prepare update data
        update_data = {}
        allowed_fields = [
            'product_name', 'category_name', 'brand_name', 'brand_logo',
            'description', 'link', 'show_in_app', 'new_product', 'discount', 'is_spare_part'
        ]
        
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]
        
        if update_data:
            update_data['updated_at'] = datetime.datetime.utcnow()
            
            # Update product
            result = collection.update_one(
                {"_id": product["_id"]},
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                # Get updated product
                updated_product = collection.find_one({"_id": product["_id"]})
                return jsonify({
                    "success": True,
                    "data": serialize_product(updated_product),
                    "message": "Product updated successfully"
                })
            else:
                return jsonify({
                    "success": True,
                    "data": serialize_product(product),
                    "message": "No changes made"
                })
        else:
            return jsonify({
                "success": False,
                "error": "No valid fields to update"
            }), 400
    
    except ValueError as e:
        return jsonify({
            "success": False,
            "error": "Invalid price format"
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/products/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Soft delete a product (set show_in_app=false)"""
    try:
        # Try to find product by product_id first
        try:
            pid = int(product_id)
            product = collection.find_one({"product_id": pid})
        except ValueError:
            # If not a valid int, try ObjectId
            try:
                product = collection.find_one({"_id": ObjectId(product_id)})
            except InvalidId:
                return jsonify({
                    "success": False,
                    "error": "Invalid product ID format"
                }), 400
        
        if not product:
            return jsonify({
                "success": False,
                "error": "Product not found"
            }), 404
        
        # Soft delete by setting show_in_app to false
        result = collection.update_one(
            {"_id": product["_id"]},
            {
                "$set": {
                    "show_in_app": False,
                    "updated_at": datetime.datetime.utcnow()
                }
            }
        )
        
        if result.modified_count > 0:
            return jsonify({
                "success": True,
                "message": "Product deleted successfully"
            })
        else:
            return jsonify({
                "success": True,
                "message": "Product was already inactive"
            })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "error": "Endpoint not found"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "error": "Internal server error"
    }), 500

if __name__ == '__main__':
    if not client:
        print("Cannot start server: MongoDB connection failed")
        exit(1)
    
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    print(f"Starting Flask server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)