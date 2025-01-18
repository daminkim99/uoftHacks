from fastapi import FastAPI
import items

app = FastAPI(
    title="FastAPI Project",
    description="A template FastAPI project",
    version="1.0.0",
)

# Include routers
app.include_router(items.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to FastAPI!"}
