import React from 'react'


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


