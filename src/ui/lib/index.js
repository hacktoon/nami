import React from 'react'


// HELPER FUNCTIONS ==============================================


// GENERIC WIDGETS ===============================================

export function Form(props) {
    const {className, layout, ...formProps} = props
    return <section className={`${className||''} Form ${layout}`} {...formProps}>
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

export function Button(props) {
    return <section className="Button">
        <button type="submit">{props.text}</button>
    </section>
}
