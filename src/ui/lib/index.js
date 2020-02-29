import React, { useRef, useLayoutEffect } from 'react'


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
