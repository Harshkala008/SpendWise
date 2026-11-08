import { useEffect, useRef } from 'react'

const STAR_COUNT = 150
const TRAIL_LIMIT = 70

function randomStar(width, height) {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.35 + .2,
    alpha: Math.random() * .65 + .2,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * .018 + .006,
  }
}

export default function CosmicBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const stars = []
    const trail = []
    let animationFrame
    let width = 0
    let height = 0

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * pixelRatio
      canvas.height = height * pixelRatio
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      stars.length = 0
      for (let index = 0; index < STAR_COUNT; index += 1) stars.push(randomStar(width, height))
    }

    const addTrailStar = (event) => {
      if (reduceMotion) return
      trail.push({
        x: event.clientX + (Math.random() - .5) * 10,
        y: event.clientY + (Math.random() - .5) * 10,
        radius: Math.random() * 1.8 + .7,
        life: 1,
        drift: (Math.random() - .5) * .7,
      })
      if (trail.length > TRAIL_LIMIT) trail.shift()
    }

    const draw = (time) => {
      context.clearRect(0, 0, width, height)

      stars.forEach((star) => {
        const opacity = star.alpha + Math.sin(time * star.speed + star.phase) * .16
        context.beginPath()
        context.fillStyle = `rgba(220, 213, 255, ${Math.max(opacity, .05)})`
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        context.fill()
      })

      trail.forEach((star, index) => {
        star.life -= .018
        star.y -= .18
        star.x += star.drift
        context.beginPath()
        context.fillStyle = `rgba(174, 164, 255, ${Math.max(star.life, 0) * .85})`
        context.shadowBlur = 12
        context.shadowColor = '#8c83ff'
        context.arc(star.x, star.y, Math.max(star.radius * star.life, 0), 0, Math.PI * 2)
        context.fill()
        if (star.life <= 0) trail.splice(index, 1)
      })
      context.shadowBlur = 0

      if (!reduceMotion) animationFrame = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', addTrailStar, { passive: true })
    animationFrame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', addTrailStar)
    }
  }, [])

  return <canvas ref={canvasRef} className="cosmic-background" aria-hidden="true" />
}