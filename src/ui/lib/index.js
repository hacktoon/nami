import React from 'react'


// HELPER FUNCTIONS ==============================================


// GENERIC WIDGETS ===============================================

export function Form(props) {
    const {className, layout, ...formProps} = props
    return <section className={`${className||''} ${layout} Form`} {...formProps}>
        {props.children}
    </section>
}

export function Grid(props) {
    const {className, ...gridProps} = props
    return <section className={`${className} Grid`} {...gridProps}>
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