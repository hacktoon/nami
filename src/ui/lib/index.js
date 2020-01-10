import React from 'react'


// HELPER FUNCTIONS ==============================================


// GENERIC WIDGETS ===============================================

export function Grid(props) {
    const {className, ...rowProps} = props
    return <section className={`${className} Grid`} {...rowProps}>
        {props.children}
    </section>
}


export function Row(props) {
    const {className, ...rowProps} = props
    return <section className={`${className} Row`} {...rowProps}>
        {props.children}
    </section>
}

export function Column(props) {
    const {className, ...colProps} = props
    return <section className={`${className} Column`} {...colProps}>
        {props.children}
    </section>
}

// PUBLIC WIDGETS =================================================