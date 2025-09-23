from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(100), nullable = False)
    email = db.Column(db.String(100), unique = True, nullable = False)
    password = db.Column(db.String(100), nullable = False)
    type = db.Column(db.String, nullable = False) # customer or delivery

    orders = db.relationship("Order", backref= "customer")

class Product(db.Model):
    __tablename__ = "products"
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(100), nullable = False)
    price = db.Column(db.Float, nullable = False)

    orders = db.relationship("Order", backref="product")

class Order(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key = True)
    customer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable = False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id") nullable = False)
    address = db.Column(db.String(100), nullable = False)
    price = db.column(db.Float, nullable = False)
    status = db.Column(db.String, default = "pending") # pending, start delivery, delivered
