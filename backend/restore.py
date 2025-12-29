import os
import shutil

pycache_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "__pycache__"))
backend_dir = os.path.dirname(__file__)

files = [
    "frances", "santander", "galicia", "icbc", "macro", 
    "nacion", "provincia", "supervielle", "hsbc", "credicoop", "mercadopago"
]

for name in files:
    pyc_name = f"{name}.cpython-312.pyc"
    src = os.path.join(pycache_dir, pyc_name)
    dst = os.path.join(backend_dir, f"{name}.pyc")
    
    if os.path.exists(src):
        # Remove empty .py
        py_file = os.path.join(backend_dir, f"{name}.py")
        if os.path.exists(py_file):
            print(f"Removing empty {py_file}")
            os.remove(py_file)
        
        # Copy .pyc
        print(f"Restoring {name} from {src} to {dst}")
        shutil.copy(src, dst)
    else:
        print(f"Warning: {src} not found")
