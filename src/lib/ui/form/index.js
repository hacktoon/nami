import React, { useRef } from 'react'

import { TYPE_FIELD_MAP } from './field'


export function Form({data, schema, onSubmit, ...props}) {
    const handleSubmit = event => {
        event.preventDefault()
        const map = createValueMap(event.target.elements, schema)
        const params = schema.parse(map)
        onSubmit(params)
    }

    const createValueMap = (inputs, schema) => {
        const entries = Array.from(inputs)
            .filter(input => schema.has(input.name))
            .map(({name, value}) => [name, value])
        return new Map(entries)
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
        const FieldComponent = TYPE_FIELD_MAP[type]
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