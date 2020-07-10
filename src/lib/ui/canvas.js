import React, { useState, useRef, useLayoutEffect } from 'react'


function useWindowSize() {
    const [size, setSize] = useState([0, 0])
    useLayoutEffect(() => {
      const updateSize = () => setSize([window.innerWidth, window.innerHeight])
      window.addEventListener('resize', updateSize)
      updateSize()
      return () => window.removeEventListener('resize', updateSize)
    }, [])
    return size
  }


export function Canvas({onSetup}) {
    const viewportRef = useRef(null)
    const canvasRef = useRef(null)

    useWindowSize()
    useLayoutEffect(() => {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        const viewport = viewportRef.current
        const width = canvas.width = viewport.clientWidth
        const height = canvas.height = viewport.clientHeight
        onSetup({context, width, height})
    })

    return <div className="Canvas" ref={viewportRef}>
        <canvas ref={canvasRef} ></canvas>
    </div>
}