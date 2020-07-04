import React, { useState } from 'react'

import { TYPE_FIELD_MAP } from './field'


export function Form({type, onSubmit, onChange, ...props}) {
    const [data, setData] = useState(type.schema.defaultConfig)
    const handleSubmit = event => {
        event.preventDefault()
        onSubmit && onSubmit(data)
        // TODO: get errors here from onSubmit
    }
    const handleChange = (name, value) => {
        const newData = {...data, [name]: value}
        setData(newData)
        onChange && onChange(newData)
        // TODO: get errors here from onChange
    }
    return <form className="Form" onSubmit={handleSubmit} {...props}>
        {buildFields(type.schema.fields, handleChange)}
        {props.children}
    </form>
}


function buildFields(fields, onChange) {
    return fields.map(({type, ...props}, id) => {
        const FieldComponent = TYPE_FIELD_MAP[type]
        return FieldComponent({id, onChange, ...props})
    })
}
