from sqlalchemy import Column, Integer, String, Float

from database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Float)
    category = Column(String)
    image = Column(String)
    description = Column(String)
    stock = Column(Integer)