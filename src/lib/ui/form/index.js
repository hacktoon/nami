import React, { useState } from 'react'

import { TYPE_FIELD_MAP } from './field'


export function Form({type, onSubmit, onChange, ...props}) {
    const [data, setData] = useState(type.schema.defaults)
    const handleSubmit = event => {
        event.preventDefault()
        onSubmit && onSubmit(data)
    }
    const handleChange = (name, value) => {
        const newData = {...data, [name]: value}
        setData(newData)
        onChange && onChange(newData)
    }
    return <form className="Form" onSubmit={handleSubmit} {...props}>
        {buildFields(type.schema.fields, handleChange)}
        {props.children}
    </form>
}


function buildFields(fields, handleChange) {
    return fields.map((field, id) => {
        const {type, sanitize, ...props} = field
        const FieldComponent = TYPE_FIELD_MAP[type]
        const onChange = (name, value) => handleChange(name, sanitize(value))
        return FieldComponent({id, onChange, ...props})
    })
}
