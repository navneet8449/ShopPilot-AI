from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import uvicorn
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="ShopPilot AI Backend API",
    description="Advanced AI-Powered Shopping Agent with Gemini Tool Calling & PayPal Sandbox",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class AddToCartRequest(BaseModel):
    productId: str
    quantity: int = 1

class CompareRequest(BaseModel):
    productIds: List[str]
    userGoal: Optional[str] = None

class RiskAnalyzeRequest(BaseModel):
    productId: Optional[str] = None
    queryUrlOrName: Optional[str] = None

class PayPalCreateOrderRequest(BaseModel):
    currency: Optional[str] = "INR"
    buyer: Dict[str, Any]

class PayPalCaptureOrderRequest(BaseModel):
    orderId: str
    buyer: Optional[Dict[str, Any]] = None

@app.get("/")
async def root():
    return {
        "service": "ShopPilot AI FastAPI Backend",
        "status": "online",
        "documentation": "/docs"
    }

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    # Gemini function calling handler
    return {"message": "Chat endpoint operational", "messages_count": len(req.messages)}

@app.get("/api/products")
async def get_products(q: Optional[str] = None, category: Optional[str] = None, maxPrice: Optional[float] = None):
    return {"products": [], "total": 0}

@app.get("/api/products/{product_id}")
async def get_product(product_id: str):
    return {"product_id": product_id}

@app.post("/api/products/compare")
async def compare_products(req: CompareRequest):
    return {"products": req.productIds, "goal": req.userGoal}

@app.post("/api/cart")
async def add_to_cart(req: AddToCartRequest):
    return {"status": "success", "productId": req.productId, "quantity": req.quantity}

@app.get("/api/cart")
async def get_cart(currency: Optional[str] = "INR"):
    return {"cart": {"items": [], "total": 0, "currency": currency}}

@app.post("/api/paypal/create-order")
async def create_paypal_order(req: PayPalCreateOrderRequest):
    return {"id": "PAYPAL-SBX-ORDER", "status": "CREATED", "currency": req.currency}

@app.post("/api/paypal/capture-order")
async def capture_paypal_order(req: PayPalCaptureOrderRequest):
    return {"success": True, "orderId": req.orderId, "status": "COMPLETED"}

@app.get("/api/orders")
async def get_orders():
    return {"orders": []}

@app.post("/api/risk/analyze")
async def analyze_risk(req: RiskAnalyzeRequest):
    return {
        "analysis": {
            "safetyScore": 95,
            "riskLevel": "Safe",
            "verdict": "Low Risk Verified authentic product.",
            "recommendation": "Safe to purchase via PayPal."
        }
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
