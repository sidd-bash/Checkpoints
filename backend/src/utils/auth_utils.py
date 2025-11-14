import hashlib
from passlib.context import CryptContext
from jose import JWTError, jwt
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta


load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Bcrypt context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """
    Hash any-length password safely using SHA256 first.
    """
    # SHA256 hash the password
    sha256_bytes = hashlib.sha256(password.encode("utf-8")).digest()
    return pwd_context.hash(sha256_bytes)

def verify_password(password: str, hashed: str) -> bool:
    """
    Verify a password against a stored SHA256+bcrypt hash.
    """
    sha256_bytes = hashlib.sha256(password.encode("utf-8")).digest()
    return pwd_context.verify(sha256_bytes, hashed)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
    
    # JWT token
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token