import logging
import os

# Create logs folder automatically
LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    handlers=[
        logging.FileHandler(os.path.join(LOG_DIR, "edurisk.log")),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("EduRisk")