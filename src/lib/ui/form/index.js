import React, { useState } from 'react'

import { TYPE_FIELD_MAP } from './field'


export function Form({meta, values, onSubmit, onChange, ...props}) {
    const [cache, setCache] = useState(values)

    const handleSubmit = event => {
        event.preventDefault()
        const newData = {...values, ...cache}
        console.log(newData)
        // console.log(newData);
        onSubmit && onSubmit(newData)
        // TODO: get errors here from onSubmit
    }

    const handleChange = (name, value) => {
        const newData = {...values, [name]: value}
        setCache(newData)
        onChange && onChange(newData)
        // TODO: get errors here from onChange
    }

    const className = `Form ${props.className}`

    return <form className={className} onSubmit={handleSubmit}>
        {buildFields(meta, values, handleChange)}
        {props.children}
    </form>
}


function buildFields(meta, values, onChange) {
    return meta.types.map((typeClass, id) => {
        const {type, name, label, value, fieldAttrs, ...rest} = typeClass
        const FieldComponent = TYPE_FIELD_MAP[type]
        // console.log(values[name]);

        return FieldComponent({
            id, name, label, value: values[name], onChange, ...fieldAttrs, ...rest
        })
    })
}
