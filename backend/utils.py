import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("BankProcessor")

class MockStreamlit:
    def info(self, msg):
        logger.info(f"INFO: {msg}")
    
    def success(self, msg):
        logger.info(f"SUCCESS: {msg}")
    
    def warning(self, msg):
        logger.warning(f"WARNING: {msg}")
    
    def error(self, msg):
        logger.error(f"ERROR: {msg}")
        
    def write(self, *args):
        logger.info(f"WRITE: {args}")

st = MockStreamlit()
