from fastapi import APIRouter

router = APIRouter(
    prefix="/items",
    tags=["Items"]
)

@router.get("/")
def get_items():
    return [{"id": 1, "name": "Item A"}, {"id": 2, "name": "Item B"}]

@router.post("/")
def create_item(name: str, description: str):
    return {"id": 3, "name": name, "description": description}
