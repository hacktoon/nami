import React from 'react'


import { cls } from '/lib/ui'
import { TYPE_FIELD_MAP } from './field'


export function Form({className, ...props}) {
    const onSubmit = event => {
        event.preventDefault()
    }
    const _className = cls('Form', className)

    return <form className={_className} onSubmit={onSubmit} {...props}>
        {props.children}
    </form>
}



export function Form2({className, fields, ...props}) {
    const onSubmit = event => {
        event.preventDefault()
    }
    const _className = cls('Form', className)

    return <form className={_className} onSubmit={onSubmit} {...props}>
        {buildFields(fields)}
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


export function buildFields(fields) {
    return fields.map(({type, ...props}, id) => {
        const FieldComponent = TYPE_FIELD_MAP[type]
        return FieldComponent({id, onChange: ()=>{}, ...props})
    })
}
