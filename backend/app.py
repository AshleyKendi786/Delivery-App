from flask import Flask, request, jsonify
from models import db, User, Product, Order
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///delivery_app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

with app.app_context():
    db.create_all()

# --- User routes

@app.route('/')
def index():
    return(
        '<h1>Welcome to the Del Delivery App!</h1>',
        200
    )

# Signup
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 400
    
    user = User(
        name=data["name"],
        email=data["email"],
        password=data["password"],
        type=data.get("type", "customer")
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({"id": user.id, "name": user.name, "email": user.email, "type": user.type})

# Login
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(email=data["email"], type=data["type"]).first()
    
    if not user:
        return jsonify({"error": "Account not found. Please sign up first."}), 404
    
    if user.password != data["password"]:
        return jsonify({"error": "Incorrect password"}), 401

    return jsonify({"id": user.id, "name": user.name, "email": user.email, "type": user.type})


# --- product routes
@app.route("/products", methods=["POST"])
def create_product():
    data = request.json
    product = Product(
        name=data["name"],
        price=data["price"]
    )
    db.session.add(product)
    db.session.commit()
    return jsonify({"id": product.id, "name": product.name, "price": product.price})

@app.route("/products", methods=["GET"])
def get_products():
    products = Product.query.all()
    return jsonify([{"id": p.id, "name": p.name, "price": p.price} for p in products])


# --- order routes
@app.route("/orders", methods=["POST"])
def create_order():
    data = request.json
    customer_id = data["customer_id"]
    product_name = data["productName"].strip().lower()  # normalize
    address = data["address"]
    price = data.get("price", 0)

    # check if product exists
    product = Product.query.filter_by(name=product_name).first()
    if not product:
        product = Product(name=product_name, price=price)
        db.session.add(product)
        db.session.commit()

    # create the order
    order = Order(
        customer_id=customer_id, product_id=product.id, address=address, price=price or product.price, status="pending"
    )
    db.session.add(order)
    db.session.commit()
    return jsonify({
        "id": order.id,
        "customerId": order.customer_id,
        "customerName": order.customer.name,
        "productId": product.id,
        "productName": product.name,
        "address": order.address,
        "price": order.price,
        "status": order.status
    })

@app.route("/orders", methods=["GET"])
def get_orders():
    orders = Order.query.all()
    result = []
    for o in orders:
        result.append({
            "id": o.id,
            "customerId": o.customer_id,
            "customerName": o.customer.name,
            "productId": o.product_id,
            "productName": o.product.name,
            "address": o.address,
            "price": o.price,
            "status": o.status
        })
    return jsonify(result)

@app.route("/orders/<int:order_id>", methods=["PUT"])
def update_order(order_id):
    data = request.json
    order = Order.query.get_or_404(order_id)

    # update product if productName is provided
    if "productName" in data:
        product_name = data["productName"].strip().lower()
        product = Product.query.filter_by(name=product_name).first()
        if not product:
            product = Product(
                name=product_name, price=float(data.get("price", order.price))
            )
            db.session.add(product)
            db.session.commit()
        order.product_id = product.id

    if "status" in data:
        order.status = data["status"]
    if "address" in data:
        order.address = data["address"]
    if "price" in data:
        order.price = float(data["price"])

    db.session.commit()
    return jsonify({
        "id": order.id,
        "customerId": order.customer_id,
        "customerName": order.customer.name,
        "productId": order.product.id,
        "productName": order.product.name,
        "address": order.address,
        "price": order.price,
        "status": order.status
    })

@app.route("/orders/<int:order_id>", methods=["DELETE"])
def delete_order(order_id):
    order = Order.query.get_or_404(order_id)
    db.session.delete(order)
    db.session.commit()
    return jsonify({"message": "Order deleted"})

@app.route("/orders/customer/<int:customer_id>", methods=["GET"])
def get_customer_orders(customer_id):
    orders = Order.query.filter_by(customer_id=customer_id).all()
    result = []
    for o in orders:
        result.append({
            "id": o.id,
            "customerId": o.customer_id,
            "customerName": o.customer.name,
            "productId": o.product_id,
            "productName": o.product.name,
            "address": o.address,
            "price": o.price,
            "status": o.status
        })
    return jsonify(result)

if __name__ == "__main__":
    app.run(port=5555, debug=True)