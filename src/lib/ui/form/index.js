import React, { useState } from 'react'

import { TYPE_FIELD_MAP } from './field'


export function Form({meta, values, onSubmit, onChange, ...props}) {
    const [formData, setFormData] = useState(values)

    const handleSubmit = event => {
        event.preventDefault()
        onSubmit && onSubmit(formData)
    }

    const handleChange = (name, value) => {
        const newData = {...values, [name]: value}
        setFormData(newData)
        onChange && onChange(newData)
    }

    const buildFields = (values, onChange) => {
        return meta.types.map((typeObject, id) => {
            const {type, name, label, value, fieldAttrs, ...props} = typeObject
            const FieldComponent = TYPE_FIELD_MAP[type]
            return <FieldComponent
                key={id}
                name={name}
                label={label}
                value={values[name]}
                onChange={onChange}
                {...fieldAttrs}
                {...props}
            />
        })
    }

    return <form className={`Form ${props.className}`} onSubmit={handleSubmit}>
        {buildFields(values, handleChange)}
        {props.children}
    </form>
}


export function Form2({data, onSubmit, onChange, ...props}) {
    const handleSubmit = event => {
        event.preventDefault()
        const inputs = Array.from(event.target.elements)
        const newData = new Map()
        inputs.map(input => {
            if (data.has(input.name)) {
                newData.set(input.name, input.value)
            }
        })
        onSubmit(newData)
    }

    const handleChange = (name, value) => {

    }

    return <form className={`Form ${props.className}`} onSubmit={handleSubmit}>
        {props.children}
    </form>
}


