from app.core.database import engine, Base
from app.models.user import User
from app.models.verification import Verification

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("✓ Tables created successfully!")
