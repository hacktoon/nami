import React, { useRef, useState, useLayoutEffect } from 'react'


// HELPER FUNCTIONS ==============================================

export function cls(...classNames) {
    return classNames.join(' ')
}


// BASE COMPONENT ===============================================

export function Component(props) {
    return <section {...props}>
        {props.children}
    </section>
}


// GENERIC WIDGETS ===============================================

export function Text({className, ...props}) {
    return <p className={cls('Text', className)} {...props}>
        {props.children}
    </p>
}

// GENERIC FORM WIDGETS ===============================================

export function Form({className, ...props}) {
    return <form className={cls('Form', className)} {...props}>
        {props.children}
    </form>
}

export function Button(props) {
    return <button className="Button" onClick={props.onClick}>
        {props.text}
    </button>
}


// CANVAS WIDGETS ===============================================

export function Canvas(props) {
    const painter = props.painter || function() {}
    const viewportRef = useRef(null)
    const canvasRef = useRef(null)

    useLayoutEffect(() => {
        const canvas = canvasRef.current
        const width = canvas.width = viewportRef.current.clientWidth
        const height = canvas.height = viewportRef.current.clientHeight
        painter(canvas.getContext('2d'), width, height, props.offset)
    })

    return <div className="CanvasWrapper" ref={viewportRef}>
        <canvas ref={canvasRef} ></canvas>
    </div>
}


export function MouseTracking(props) {
    const [dragOrigin, setDragOrigin] = useState(new Point(0, 0))
    const [dragging, setDragging] = useState(false)
    const [offset, setOffset] = useState(new Point(0, 0))

    const onMouseMove = event => {
        if (! dragging) return
        const mousePoint = getMousePoint(event)
        props.onDrag(getTotalOffset(mousePoint))
    }

    const onMouseDown = event => {
        event.preventDefault()
        setDragOrigin(getMousePoint(event))
        setDragging(true)
    }

    const onMouseUp = event => {
        const mousePoint = getMousePoint(event)
        setOffset(getTotalOffset(mousePoint))
        setDragging(false)
    }

    const getTotalOffset = point => {
        return dragOrigin.minus(point).plus(offset)
    }

    const getMousePoint = event => {
        const { offsetX: x, offsetY: y } = event.nativeEvent
        return new Point(x, y)
    }

    return (
        <div className="tracker"
            onMouseLeave={() => setDragging(false)}
            onMouseUp={onMouseUp}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}>
        </div>
    )
}