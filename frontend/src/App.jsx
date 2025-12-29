import { useState, useEffect } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, File as FileIcon, Loader2 } from 'lucide-react'
import './index.css'

const API_URL = "http://127.0.0.1:8000"

function App() {
  const [banks, setBanks] = useState([])
  const [selectedBank, setSelectedBank] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    fetchBanks()
  }, [])

  const fetchBanks = async () => {
    try {
      const res = await axios.get(`${API_URL}/banks`)
      setBanks(res.data)
      if (res.data.length > 0) setSelectedBank(res.data[0].id)
    } catch (err) {
      console.error(err)
      setError("No se pudo conectar con el servidor backend. Asegúrate de que esté corriendo.")
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile)
        setError(null)
        setSuccess(null)
      } else {
        setError("Por favor sube solo archivos PDF.")
      }
    }
  }

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
      setSuccess(null)
    }
  }

  const handleProcess = async () => {
    if (!file || !selectedBank) return
    setLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post(`${API_URL}/process?bank=${encodeURIComponent(selectedBank)}`, formData, {
        responseType: 'blob',
      })

      // Download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      const contentDisposition = response.headers['content-disposition']
      let fileName = `${selectedBank}_procesado.xlsx`
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/)
        if (fileNameMatch && fileNameMatch.length === 2) fileName = fileNameMatch[1]
      }
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      setSuccess("¡Archivo procesado con éxito!")
    } catch (err) {
      console.error(err)
      if (err.response && err.response.data instanceof Blob) {
        // Read blob error
        const reader = new FileReader()
        reader.onload = () => {
          const text = reader.result
          try {
            const json = JSON.parse(text)
            setError(json.detail || "Error al procesar.")
          } catch (e) {
            setError("Error desconocido al procesar.")
          }
        }
        reader.readAsText(err.response.data)
      } else {
        setError("No se pudo procesar el archivo. Revisa que el formato sea correcto.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <header style={{ marginBottom: '3rem', marginTop: '1rem' }}>
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '800',
            background: 'linear-gradient(to right, #e2e8f0, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            letterSpacing: '-0.02em',
            lineHeight: 1.1
          }}>
            Conversor Bancario
          </h1>
          <p style={{ marginTop: '0.5rem', color: '#64748b', fontSize: '1.1rem' }}>
            Transforma tus resúmenes bancarios PDF a Excel
          </p>
        </motion.div>
      </header>

      <motion.div
        className="card"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.95rem', color: '#cbd5e1', fontWeight: 500 }}>
            Selecciona tu Banco
          </label>
          <div style={{ position: 'relative' }}>
            <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)}>
              {banks.length === 0 && <option>Cargando bancos...</option>}
              {banks.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div
          className={`dropzone ${dragActive ? 'dragover' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload').click()}
        >
          <input
            id="file-upload"
            type="file"
            accept=".pdf"
            onChange={handleChange}
            style={{ display: 'none' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            {file ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
              >
                <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '1rem', borderRadius: '50%' }}>
                  <FileIcon size={40} color="#818cf8" />
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <p style={{ fontWeight: '600', margin: 0, color: '#e2e8f0' }}>{file.name}</p>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </motion.div>
            ) : (
              <>
                <div style={{ background: 'rgba(148, 163, 184, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                  <Upload size={40} color="#94a3b8" />
                </div>
                <div>
                  <p style={{ color: '#e2e8f0', fontWeight: 500, margin: '0 0 0.25rem 0' }}>Sube tu archivo PDF</p>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Arrastra y suelta o haz clic para explorar</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ marginTop: '2.5rem' }}>
          <button
            className="btn-primary"
            onClick={handleProcess}
            disabled={!file || loading || !selectedBank}
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem' }}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <FileSpreadsheet size={20} />}
            {loading ? 'Procesando...' : 'Convertir a Excel'}
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#fca5a5', display: 'flex', alignItems: 'start', gap: '0.75rem', textAlign: 'left' }}>
                <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.95rem' }}>{error}</span>
              </div>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px', color: '#86efac', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle size={20} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.95rem' }}>{success}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <footer style={{ marginTop: '4rem', color: '#475569', fontSize: '0.85rem' }}>
        <p>© 2025 Conversor Bancario - Versión Web Independiente</p>
      </footer>
    </div>
  )
}

export default App
