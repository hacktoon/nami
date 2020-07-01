import React, { useState } from 'react'


import { cls } from '/lib/ui'
import { TYPE_FIELD_MAP } from './field'


export function Form({className, schema, onSubmit, onChange, ...props}) {
    const [data, setData] = useState(schema.defaults)
    const handleSubmit = event => {
        event.preventDefault()
        onSubmit(data)
    }
    const handleFieldChange = (name, value) => {
        const newData = {...data, [name]: value}
        setData(newData)
        onChange(newData)
    }
    const _className = cls('Form', className)
    return <form className={_className} onSubmit={handleSubmit} {...props}>
        {buildFields(schema.fields, handleFieldChange)}
        {props.children}
    </form>
}


export function buildFields(fields, onChange) {
    return fields.map(({type, ...props}, id) => {
        const FieldComponent = TYPE_FIELD_MAP[type]
        return FieldComponent({id, onChange, ...props})
    })
}
