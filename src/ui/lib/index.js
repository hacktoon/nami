import React, { useRef, useLayoutEffect } from 'react'


// HELPER FUNCTIONS ==============================================

export function cls(...classNames) {
    return classNames.filter(name => {
        return Boolean(name) && String(name).trim()
    }).join(' ')
}

export function Layout(props) {
    const {className, ...textProps} = props
    return <div className={cls(className, 'Layout')} {...textProps}>
        {props.children}
    </div>
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

export function Grid(props) {
    const {className, ...gridProps} = props
    return <div className={cls(className, 'Grid')} {...gridProps}>
        {props.children}
    </div>
}

export function Row(props) {
    const {className, ...rowProps} = props
    return <div className={cls(className, 'Row')} {...rowProps}>
        {props.children}
    </div>
}

export function Column(props) {
    const {className, ...colProps} = props
    return <div className={cls(className, 'Column')} {...colProps}>
        {props.children}
    </div>
}


// CANVAS WIDGET ===============================================

export function Canvas(props) {
    const painter = props.painter || (() => {})
    const viewportRef = useRef(null)
    const canvasRef = useRef(null)

    useLayoutEffect(() => {
        const canvas = canvasRef.current
        const width = canvas.width = viewportRef.current.clientWidth
        const height = canvas.height = viewportRef.current.clientHeight
        painter(canvas.getContext('2d'), width, height, props.offset)
    })

    return <div className="canvasWrapper" ref={viewportRef}>
        <canvas ref={canvasRef} ></canvas>
    </div>
}
