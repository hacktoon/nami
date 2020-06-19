import React from 'react'


import { cls } from '/lib/ui'


export function Form({className, ...props}) {
    const onSubmit = event => {
        console.log(event);
        event.preventDefault()
    }
    const _className = cls('Form', className)

    return <form className={_className} onSubmit={onSubmit} {...props}>
        {props.children}
    </form>
}

export function Button(props) {
    return <button className="Button" onClick={props.onClick}>
        {props.text}
    </button>
}

export function SubmitButton(props) {
    return <button className="Button" type="submit">
        {props.text}
    </button>
}
