import React, { useState } from 'react'

import { TYPE_FIELD_MAP } from './field'


export function Form({schema, onSubmit, onChange, ...props}) {
    const [data, setData] = useState(schema.defaults)
    const handleSubmit = event => {
        event.preventDefault()
        onSubmit(data)
    }
    const handleChange = (name, value) => {
        const newData = {...data, [name]: value}
        setData(newData)
        onChange && onChange(newData)
    }
    return <form className="Form" onSubmit={handleSubmit} {...props}>
        {buildFields(schema.fields, handleChange)}
        {props.children}
    </form>
}


export function buildFields(fields, handleChange) {
    return fields.map(({type, sanitize, ...props}, id) => {
        const FieldComponent = TYPE_FIELD_MAP[type]
        const onChange = (name, value) => handleChange(name, sanitize(value))
        return FieldComponent({id, onChange, ...props})
    })
}
