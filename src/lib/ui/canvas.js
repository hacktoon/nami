import React, { useState, useRef, useLayoutEffect } from 'react'


class Render {

}


export function Canvas({onInit, tileSize, className='Canvas'}) {
    const [, setSize] = useState([0, 0])
    const viewportRef = useRef(null)
    const canvasRef = useRef(null)

    useLayoutEffect(() => {
        const canvas = canvasRef.current
        const viewport = viewportRef.current
        const context = canvas.getContext('2d')
        const width = canvas.width = viewport.clientWidth
        const height = canvas.height = viewport.clientHeight
        const updateSize = () => setSize([width, height])

        onInit({context, width, height})
        window.addEventListener('resize', updateSize)
        return () => window.removeEventListener('resize', updateSize)
    })

    return <div className={className} ref={viewportRef}>
        <canvas ref={canvasRef} ></canvas>
    </div>
}