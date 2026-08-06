import { useState, useCallback, useRef } from 'react'
import Cropper from 'react-easy-crop'
import { X, ZoomIn, Crop, Image as ImageIcon } from 'lucide-react'

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

function getOutputImg(imageSrc, pixelCrop, fit, bg) {
  return createImage(imageSrc).then((image) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    if (fit) {
      ctx.fillStyle = bg === 'black' ? '#000000' : '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      const scale = Math.min(canvas.width / image.width, canvas.height / image.height)
      const w = image.width * scale
      const h = image.height * scale
      ctx.drawImage(image, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h)
    } else {
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      )
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob)
      }, 'image/png')
    })
  })
}

export default function ImageCropper({ imageUrl, onCrop, onCancel, aspect = 1 }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [mode, setMode] = useState('crop')
  const [bg, setBg] = useState('white')
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const containerRef = useRef(null)

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  async function handleConfirm() {
    if (mode === 'fit') {
      const cw = containerRef.current?.clientWidth || 600
      const ch = containerRef.current?.clientHeight || 400
      let w = cw
      let h = Math.round(cw / aspect)
      if (h > ch) {
        h = ch
        w = Math.round(ch * aspect)
      }
      const blob = await getOutputImg(imageUrl, { x: 0, y: 0, width: w, height: h }, true, bg)
      onCrop(blob)
    } else {
      if (!croppedAreaPixels) return
      const blob = await getOutputImg(imageUrl, croppedAreaPixels, false, bg)
      onCrop(blob)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/60 sm:backdrop-blur-sm flex items-center justify-center p-4" onClick={onCancel}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-2xl dark:shadow-black/40 w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Ajustar imagen</h2>
            <button onClick={onCancel} className="p-1.5 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-1 px-5 pt-4">
            <button onClick={() => setMode('crop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === 'crop' ? 'bg-accent-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
              <Crop className="w-3.5 h-3.5" /> Recortar
            </button>
            <button onClick={() => setMode('fit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === 'fit' ? 'bg-accent-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
              <ImageIcon className="w-3.5 h-3.5" /> Completa
            </button>
          </div>

          {mode === 'fit' && (
            <div className="flex items-center gap-3 px-5 pt-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">Fondo:</span>
              <button onClick={() => setBg('white')}
                className={`w-7 h-7 rounded-full border-2 ${bg === 'white' ? 'border-accent-500 ring-2 ring-accent-500/30' : 'border-gray-300 dark:border-gray-600'}`}
                style={{ backgroundColor: '#ffffff' }} title="Fondo blanco" />
              <button onClick={() => setBg('black')}
                className={`w-7 h-7 rounded-full border-2 ${bg === 'black' ? 'border-accent-500 ring-2 ring-accent-500/30' : 'border-gray-300 dark:border-gray-600'}`}
                style={{ backgroundColor: '#000000' }} title="Fondo negro" />
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">La foto se muestra completa sin recortar</span>
            </div>
          )}

          <div ref={containerRef} className="relative w-full h-72 mt-4" style={mode === 'fit' ? { backgroundColor: bg === 'black' ? '#000000' : '#ffffff' } : {}}>
            {mode === 'fit' ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-full" style={{ aspectRatio: String(aspect), maxWidth: '100%' }}>
                  <img src={imageUrl} alt="Vista completa" className="w-full h-full object-contain" />
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-gray-900">
                <Cropper
                  image={imageUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspect}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
            )}
          </div>

          <div className="px-5 py-4 space-y-4">
            {mode === 'crop' && (
              <div className="flex items-center gap-3">
                <ZoomIn className="w-4 h-4 text-gray-400 dark:text-gray-300 shrink-0" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={onCancel}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Cancelar
              </button>
              <button onClick={handleConfirm}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-accent-600 hover:bg-accent-700 transition-colors">
                Aplicar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
