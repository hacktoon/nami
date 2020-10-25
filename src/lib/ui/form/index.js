import React, { useState } from 'react'

import { TYPE_FIELD_MAP } from './field'


export function Form({meta, values, onSubmit, onChange, ...props}) {
    const [cache, setCache] = useState(values)

    const handleSubmit = event => {
        event.preventDefault()
        onSubmit && onSubmit(cache)
        // console.log(cache);
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
        {buildFields(meta.types, values, handleChange)}
        {props.children}
    </form>
}


function buildFields(types, values, onChange) {
    return types.map((typeClass, id) => {
        const {type, name, label, value, fieldAttrs, ...rest} = typeClass
        const FieldComponent = TYPE_FIELD_MAP[type]
        return FieldComponent({
            id, name, label, value: values[name], onChange, ...fieldAttrs, ...rest
        })
    })
}
