from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import shutil
import io
import logging

# Ensure imports work from current directory
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from frances import procesar_bbva_frances
from santander import procesar_santander_rio
from galicia import procesar_galicia
from backend.icbc import procesar_icbc
from backend.icbc_formato_2 import procesar_icbc_formato_2
from backend.icbc_formato_3 import procesar_icbc_formato_3
from backend.macro import procesar_macro
from backend.nacion import procesar_nacion
from backend.provincia_1 import procesar_provincia_1
from supervielle import procesar_supervielle
# from hsbc import procesar_hsbc
from credicoop import procesar_credicoop
from mercadopago import procesar_mercadopago 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mapeo de nombres de bancos a sus funciones de procesamiento
processors = {
    "BBVA Frances": procesar_bbva_frances,
    "Santander Rio": procesar_santander_rio,
    "Galicia": procesar_galicia,
    "ICBC": procesar_icbc,
    "ICBC Formato 2": procesar_icbc_formato_2,
    "ICBC Formato 3": procesar_icbc_formato_3,
    "Macro": procesar_macro,
    "Nacion": procesar_nacion,
    "Provincia Formato 1": procesar_provincia_1,
    "Supervielle": procesar_supervielle,
    # "HSBC": procesar_hsbc,
    "Credicoop": procesar_credicoop,
    "MercadoPago": procesar_mercadopago
}

@app.get("/banks")
def get_banks():
    return [{"id": k, "name": k} for k in processors.keys()]

@app.post("/process")
async def process_bank(bank: str, file: UploadFile = File(...)):
    if bank not in processors:
        raise HTTPException(status_code=400, detail="Banco no soportado")
    
    processor = processors[bank]
    
    try:
        content = await file.read()
        file_obj = io.BytesIO(content)
        file_obj.name = file.filename 
        
        # Invoke the processor
        result_bytes = processor(file_obj)
        
        if result_bytes is None:
             raise HTTPException(status_code=422, detail="No se pudo procesar el archivo. Verifique el formato o si el PDF contiene los datos esperados.")
             
        filename = f"{bank.replace(' ', '_')}_procesado.xlsx"
        
        return Response(
            content=result_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
