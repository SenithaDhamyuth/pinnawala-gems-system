from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1. App එක පටන් ගන්නවා
app = FastAPI()

# 2. Frontend එකට (React) අවසර දීම (CORS Setup)
# මේක නැත්නම් React එකෙන් Backend එකට කතා කරන්න බෑ.
origins = [
    "http://localhost:3000",
    "http://localhost:5173",  # Vite React Port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. මූලික API Endpoints (Tests)

@app.get("/")
def home():
    return {
        "message": "Welcome to Pinnawala Gems API! 💎",
        "status": "Server is Running Smoothly",
        "version": "1.0.0"
    }

@app.get("/api/check")
def check_system():
    return {
        "database": "Not Connected (Yet)",
        "ai_engine": "Ready to Load",
        "user": "Admin"
    }

# 4. Gem Price Test (නිකන් ගාණක් පෙන්නන්න)
@app.get("/api/predict-price-test")
def predict_test():
    return {
        "gem_type": "Blue Sapphire",
        "weight": "1.0 Ct",
        "estimated_price_lkr": 350000.00
    }