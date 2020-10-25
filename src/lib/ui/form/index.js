import React, { useState } from 'react'

import { TYPE_FIELD_MAP } from './field'


export function Form({meta, values, onSubmit, onChange, ...props}) {
    const [data, setData] = useState(values)

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

    const className = `Form ${props.className}`

    return <form className={className} onSubmit={handleSubmit}>
        {buildFields(meta, values, handleChange)}
        {props.children}
    </form>
}


function buildFields(meta, data, onChange) {
    return meta.types.map((typeClass, id) => {
        const {type, name, label, value, fieldAttrs, ...rest} = typeClass
        const FieldComponent = TYPE_FIELD_MAP[type]
        // console.log(data[name]);

        return FieldComponent({
            id, name, label, value: data[name], onChange, ...fieldAttrs, ...rest
        })
    })
}
