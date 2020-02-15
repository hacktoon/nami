import React, { useRef, useLayoutEffect } from 'react'


// HELPER FUNCTIONS ==============================================

export function cls(...classNames) {
    return classNames.filter(name => {
        return Boolean(name) && String(name).trim()
    }).join(' ')
}


// GENERIC WIDGETS ===============================================

export function Text(props) {
    const {className, ...textProps} = props
    return <p className={cls(className, 'Text')} {...textProps}>
        {props.children}
    </p>
}

// GENERIC FORM WIDGETS ===============================================

export function Form(props) {
    const {className, ...formProps} = props
    return <div className={cls(className, 'Form')} {...formProps}>
        {props.children}
    </div>
}

export function Button(props) {
    return <button className="Button" onClick={props.onClick}>
        {props.text}
    </button>
}


// LAYOUT WIDGETS ===============================================

export function Layout(props) {
    const {className, ...textProps} = props
    return <div className={cls(className, 'Layout')} {...textProps}>
        {props.children}
    </div>
}


// CANVAS WIDGET ===============================================

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
