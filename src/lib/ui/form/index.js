import React, { useState } from 'react'

import { TYPE_FIELD_MAP, TYPE_FIELD_MAP2 } from './field'


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


export function Form2({data, schema, onSubmit, ...props}) {
    const handleSubmit = event => {
        event.preventDefault()
        const entries = Array.from(event.target.elements)
            .filter(input => schema.has(input.name))
            .map(input => [input.name, input.value])
        onSubmit(new Map(entries))
    }

    return <form className={`Form ${props.className}`} onSubmit={handleSubmit}>
        <FieldSet types={schema.types} data={data} />
        {props.children}
    </form>
}


function FieldSet({types, data}) {
    return types.map((typeObject, id) => {
        const {
            type, name, label, defaultValue, fieldAttrs, ...props
        } = typeObject
        const FieldComponent = TYPE_FIELD_MAP2[type]
        return <FieldComponent
            key={id}
            name={name}
            label={label}
            defaultValue={data.get(name)}
            {...fieldAttrs}
            {...props}
        />
    })
}