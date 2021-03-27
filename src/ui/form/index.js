import React, { useState } from 'react'

import { FieldSet } from './field'


export function Form({data, onSubmit, ...props}) {
    const [valueMap, setValueMap] = useState(data.valueMap)

    const handleSubmit = event => {
        event.preventDefault()
        const rawInputs = Array.from(event.target.elements)
        const inputs = rawInputs.filter(input => input.name.trim().length > 0)
        const entries = inputs.map(input => [input.name, input.value])
        const schemaInstance = data.schema.parse(new Map(entries))
        onSubmit(schemaInstance)
    }

    const handleChange = (name, value) => {
        valueMap.set(name, value)
        console.log(name, value);
        // onSubmit(data.schema.parse(valueMap))
        setValueMap(valueMap)
    }

    const className = `Form ${props.className}`
    return data.size > 0 && <form className={className} onSubmit={handleSubmit}>
        <FieldSet types={data.types} data={data} onChange={handleChange} />
        {props.children}
    </form>
}

