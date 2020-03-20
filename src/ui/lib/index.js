import React from 'react'


// HELPER FUNCTIONS ==============================================

export function cls(...classNames) {
    return classNames.join(' ')
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
