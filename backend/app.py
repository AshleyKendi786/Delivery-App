from flask import Flask, request, jsonify
from models import db, User, Product, Order

app = Flask(__name__)

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
