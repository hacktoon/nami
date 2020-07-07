import React, { useState } from 'react'

import { TYPE_FIELD_MAP } from './field'


export function Form({schema, onSubmit, onChange, ...props}) {
    const [data, setData] = useState(schema.defaultConfig)
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
        {buildFields(schema, handleChange)}
        {props.children}
    </form>
}


function buildFields(schema, onChange) {
    return schema.types.map(({type, props, ...rest}, id) => {
        const FieldComponent = TYPE_FIELD_MAP[type]
        return FieldComponent({id, onChange, ...props, ...rest})
    })
}
