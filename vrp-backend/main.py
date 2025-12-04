from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from typing import List, Optional

VROOM_URL = os.getenv("VROOM_URL", "http://localhost:3000")
OSRM_URL = os.getenv("OSRM_URL", "http://localhost:5000")

app = FastAPI(title="Vehicle Routing API")

# Enable CORS for your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:3001",],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request validation
class Location(BaseModel):
    lon: float
    lat: float

class Job(BaseModel):
    id: int
    location: List[float]  # [lon, lat]
    service: Optional[int] = 300  # service time in seconds
    delivery: Optional[List[int]] = None  # delivery amounts
    pickup: Optional[List[int]] = None  # pickup amounts

class Vehicle(BaseModel):
    id: int
    start: List[float]  # [lon, lat]
    end: Optional[List[float]] = None  # [lon, lat], defaults to start
    capacity: Optional[List[int]] = None  # vehicle capacity
    time_window: Optional[List[int]] = None  # [start, end] in seconds

class OptimizationRequest(BaseModel):
    jobs: List[Job]
    vehicles: List[Vehicle]

class OptimizationResponse(BaseModel):
    code: int
    summary: dict
    routes: List[dict]

# Health check
@app.get("/")
async def root():
    return {"status": "ok", "service": "Vehicle Routing API"}

# Check if VROOM is accessible
@app.get("/health")
async def health_check():
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            osrm_response = await client.get(OSRM_URL)
            # VROOM doesn't have a health endpoint, so we'll just check if it's reachable
        return {
            "status": "healthy",
            "osrm": "connected",
            "vroom": "assumed connected"
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unavailable: {str(e)}")

# Main optimization endpoint
@app.post("/optimize", response_model=OptimizationResponse)
async def optimize_route(request: OptimizationRequest):
    """
    Optimize vehicle routes using VROOM
    
    Example request:
    {
      "vehicles": [
        {
          "id": 1,
          "start": [26.1025, 44.4268],
          "end": [26.1025, 44.4268],
          "capacity": [100]
        }
      ],
      "jobs": [
        {"id": 1, "location": [26.0964, 44.4395], "delivery": [10]},
        {"id": 2, "location": [26.1150, 44.4500], "delivery": [15]}
      ]
    }
    """
    try:
        # Prepare VROOM request
        vroom_request = {
            "vehicles": [v.dict(exclude_none=True) for v in request.vehicles],
            "jobs": [j.dict(exclude_none=True) for j in request.jobs]
        }
        
        # Call VROOM
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                VROOM_URL,
                json=vroom_request
            )
            response.raise_for_status()
            
        result = response.json()
        
        return OptimizationResponse(
            code=result.get("code", 0),
            summary=result.get("summary", {}),
            routes=result.get("routes", [])
        )
        
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error calling VROOM service: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Optimization failed: {str(e)}"
        )

# Get route details from OSRM
@app.post("/route")
async def get_route(start: List[float], end: List[float]):
    """
    Get route details between two points
    
    Example: POST /route with body:
    {
      "start": [26.1025, 44.4268],
      "end": [26.0964, 44.4395]
    }
    """
    try:
        coordinates = f"{start[0]},{start[1]};{end[0]},{end[1]}"
        url = OSRM_URL+f"/route/v1/driving/{coordinates}?overview=full&geometries=geojson"
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            
        return response.json()
        
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error calling OSRM service: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
