import os
from contextlib import asynccontextmanager
from decimal import Decimal
from fastapi import FastAPI, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

from backend.db import engine, Base, get_db, ensure_database_exists
from backend.models import User, Category, Unit, Product, Customer, Supplier
from backend.utils.security import hash_password
from backend.routes import (
    auth, catalog, purchases, suppliers, pos, khata, expenses, reports
)

# Read CORS origins from environment
raw_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost:4173"
)
origins = [o.strip() for o in raw_origins.split(",") if o.strip()]

def seed_initial_defaults():
    """Seed foundational roles, categories, and units if tables are fresh."""
    from backend.db import SessionLocal
    db = SessionLocal()
    try:
        # 1. Seed Users if table is empty
        if db.query(User).count() == 0:
            admin_pwd = hash_password("admin123")
            staff_pwd = hash_password("staff123")
            admin = User(
                name="Haji Muhammad Usman",
                phone="0300-8451299",
                password_hash=admin_pwd,
                role="shopkeeper",
                is_active=True
            )
            staff = User(
                name="Hamza Farooq",
                phone="0321-4567890",
                password_hash=staff_pwd,
                role="staff",
                is_active=True
            )
            db.add_all([admin, staff])
            db.commit()
            print("[Database Seed] Seeded default Shopkeeper & Staff accounts.")

        # 2. Seed Default Categories if empty
        if db.query(Category).count() == 0:
            default_cats = [
                Category(name="Grocery", color_hex="#0F766E", is_quick_preset=True),
                Category(name="Dairy", color_hex="#2563EB", is_quick_preset=True),
                Category(name="Cosmetics", color_hex="#EC4899", is_quick_preset=True),
                Category(name="Bakery", color_hex="#EA580C", is_quick_preset=True),
                Category(name="Beverages", color_hex="#7C3AED", is_quick_preset=True),
                Category(name="Snacks", color_hex="#DB2777", is_quick_preset=True),
                Category(name="Household", color_hex="#059669", is_quick_preset=True),
            ]
            db.add_all(default_cats)
            db.commit()
            print("[Database Seed] Seeded preset categories.")

        # 3. Seed Default Measurement Units if empty
        if db.query(Unit).count() == 0:
            # Base units
            u_kg = Unit(name="Kilogram", short_code="kg", base_unit_id=None, conversion_multiplier=Decimal("1.0000"))
            u_l = Unit(name="Litre", short_code="L", base_unit_id=None, conversion_multiplier=Decimal("1.0000"))
            u_pc = Unit(name="Piece", short_code="pc", base_unit_id=None, conversion_multiplier=Decimal("1.0000"))
            db.add_all([u_kg, u_l, u_pc])
            db.commit()
            db.refresh(u_kg)
            db.refresh(u_l)
            db.refresh(u_pc)

            # Sub-units
            u_g = Unit(name="Gram", short_code="g", base_unit_id=u_kg.id, conversion_multiplier=Decimal("0.0010"))
            u_ml = Unit(name="Millilitre", short_code="ml", base_unit_id=u_l.id, conversion_multiplier=Decimal("0.0010"))
            u_doz = Unit(name="Dozen", short_code="doz", base_unit_id=u_pc.id, conversion_multiplier=Decimal("12.0000"))
            u_pkt = Unit(name="Packet", short_code="pkt", base_unit_id=u_pc.id, conversion_multiplier=Decimal("1.0000"))
            u_ctn = Unit(name="Carton", short_code="ctn", base_unit_id=u_pc.id, conversion_multiplier=Decimal("24.0000"))
            db.add_all([u_g, u_ml, u_doz, u_pkt, u_ctn])
            db.commit()
            print("[Database Seed] Seeded units with conversion multipliers.")

    except Exception as e:
        db.rollback()
        print(f"[Database Seed Warning] {e}")
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context for automated database bootstrap and schema checks."""
    try:
        ensure_database_exists()
        Base.metadata.create_all(bind=engine)
        seed_initial_defaults()
    except Exception as e:
        print(f"[Startup Warning] Could not connect to MySQL at startup: {e}")
    yield

app = FastAPI(
    title="DukaanKhata: Retail POS & Digital Khata Backend API",
    description="Production-grade REST API backend with MySQL 8.0 InnoDB engine, strict decimal precision, role-based JWT auth, and atomic transactions.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware Configuration (React.js Frontend Integration)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register All API Routers
app.include_router(auth.router)
app.include_router(catalog.router)
app.include_router(purchases.router)
app.include_router(suppliers.router)
app.include_router(pos.router)
app.include_router(khata.router)
app.include_router(expenses.router)
app.include_router(reports.router)

@app.get("/", tags=["Health Check"])
def root():
    return {
        "system": "DukaanKhata POS & Digital Khata API",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/api/health", tags=["Health Check"])
def health_check(db: Session = Depends(get_db)):
    """Check API and MySQL database connectivity."""
    try:
        db.execute(text("SELECT 1;"))
        db_status = "connected"
    except Exception as e:
        db_status = f"disconnected: {str(e)}"
    
    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status
    }

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("SERVER_HOST", "0.0.0.0")
    port = int(os.getenv("SERVER_PORT", "8000"))
    uvicorn.run("backend.main:app", host=host, port=port, reload=True)
