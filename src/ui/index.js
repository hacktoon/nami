import { React, useLayoutEffect, useState } from 'react'

import { Rect } from '/src/lib/number'


// HELPER FUNCTIONS ==============================================

export function cls(...classNames) {
    return classNames.join(' ').trim()
}


// GENERIC WIDGETS ===============================================

export function Text({className, ...props}) {
    return <p className={cls('Text', className)} {...props}>
        {props.children}
    </p>
}


export function Title({className, ...props}) {
    return <section className={cls('Title', className)} {...props}>
        {props.children}
    </section>
}


// CUSTOM HOOKS ==============================================

export function useResize(containerRef) {
    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)

    useLayoutEffect(() => {
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const handleResize = () => {
        setWidth(containerRef.current.clientWidth)
        setHeight(containerRef.current.clientHeight)
    }

    return new Rect(width, height)
}