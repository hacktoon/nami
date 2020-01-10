import React from 'react'


// HELPER FUNCTIONS ==============================================

function cls(...classNames) {
    const names = classNames.filter(name => {
        return Boolean(name)
    });
    return names.join(' ')
}


// GENERIC WIDGETS ===============================================

export function Form(props) {
    const {className, layout, ...formProps} = props
    return <section className={cls(className, 'Form', layout)} {...formProps}>
        {props.children}
    </section>
}

export function FormRow(props) {
    const {className, layout, ...formProps} = props
    const _className = cls(className, 'FormRow', 'Form', layout)
    return <section className={_className} {...formProps}>
        {props.children}
    </section>
}

export function Grid(props) {
    const {className, ...gridProps} = props
    return <section className={cls(className, 'Grid')} {...gridProps}>
        {props.children}
    </section>
}

export function Row(props) {
    const {className, ...rowProps} = props
    return <section className={cls(className, 'Row')} {...rowProps}>
        {props.children}
    </section>
}

export function Column(props) {
    const {className, ...colProps} = props
    return <section className={cls(className, 'Column')} {...colProps}>
        {props.children}
    </section>
}

export function Button(props) {
    return <section className="Button">
        <button type="submit">{props.text}</button>
    </section>
}
