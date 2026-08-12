export function createVesselIcon(size = 24): ImageData {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, size, size)
  ctx.fillStyle = '#ffffff'

  const cx = size / 2
  ctx.beginPath()
  ctx.moveTo(cx, size * 0.06)
  ctx.lineTo(size * 0.84, size * 0.9)
  ctx.lineTo(cx, size * 0.68)
  ctx.lineTo(size * 0.16, size * 0.9)
  ctx.closePath()
  ctx.fill()

  return ctx.getImageData(0, 0, size, size)
}
