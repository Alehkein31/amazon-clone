from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

# CORS para que localhost:3000 pueda conectarse
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Product(BaseModel):
    id: Optional[int] = None
    name: str
    price: float
    category: str
    description: Optional[str] = ""
    image: Optional[str] = None
    stock: Optional[int] = 100

#DB en memoria
products_db: List[Product] = [
    Product(id=1, name="Tim Hortons Mug", price=24.99, category="Mugs", description="Classic Canadian Mug", image="https://images.unsplash.com/photo-1514228742587-6b1558fcca3d", stock=100),
    Product(id=2, name="Maple Hoodie", price=59.99, category="Apparel", description="For Toronto Winter", image="https://images.unsplash.com/photo-1556821840-3a63f95609a7", stock=50),
    Product(id=3, name="CN Tower Shirt", price=29.99, category="Apparel", description="Toronto Souvenir", image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab", stock=75),
]

@app.get("/products")
def get_products():
    return products_db

@app.get("/products/{product_id}")
def get_detail(product_id: int):
    for p in products_db:
        if p.id == product_id:
            return p
    raise HTTPException(status_code=404, detail="Not found")

@app.post("/products")
def create_product(product: Product):
    new_id = max((p.id or 0 for p in products_db), default=0) + 1
    product.id = new_id
    products_db.append(product)
    return product

@app.delete("/products/{product_id}")
def delete_product(product_id: int):
    global products_db
    products_db = [p for p in products_db if p.id!= product_id]
    return {"ok": True}

@app.get("/categories")
def get_categories():
    return list(set(p.category for p in products_db))

@app.post("/seed")
def seed():
    return {"ok": True}
