import React from 'react'

import { FieldSet } from './field'


export function Form({data, schema, onSubmit, ...props}) {
    const handleSubmit = event => {
        event.preventDefault()
        const map = createValueMap(event.target.elements, schema)
        const params = schema.parse(map)
        onSubmit(params)
    }

    const createValueMap = (inputs, schema) => {
        const entries = Array.from(inputs)
            // check if input was defined in schema
            .filter(input => schema.has(input.name))
            .map(input => [input.name, input.value])
        return new Map(entries)
    }

    return <form className={`Form ${props.className}`} onSubmit={handleSubmit}>
        <FieldSet types={schema.types} data={data} />
        {schema.size ? props.children : null}
    </form>
}

