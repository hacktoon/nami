import React from 'react'

import { FieldSet } from './field'


export function Form({data, schema, onSubmit, ...props}) {
    const handleSubmit = event => {
        event.preventDefault()
        const inputs = Array.from(event.target.elements)
        const entries = inputs.map(input => [input.name, input.value])
        const params = schema.parse(new Map(entries))
        onSubmit(params)
    }

    return <form className={`Form ${props.className}`} onSubmit={handleSubmit}>
        <FieldSet types={schema.types} data={data} />
        {data.size ? props.children : null}
    </form>
}

