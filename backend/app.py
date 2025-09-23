from flask import Flask, request, jsonify
from models import db, User, Product, Order

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///delivery_app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

with app.app_context():
    db.create_all()

