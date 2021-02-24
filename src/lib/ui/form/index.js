import React from 'react'

import { FieldSet } from './field'


export function Form({data, onSubmit, ...props}) {
    const handleSubmit = event => {
        event.preventDefault()
        const inputs = Array.from(event.target.elements)
                        .filter(input => input.name.trim().length > 0)
        const entries = inputs.map(input => [input.name, input.value])
        console.log('form submitted:', new Map(entries));
        onSubmit(new Map(entries))
    }

    return <form className={`Form ${props.className}`} onSubmit={handleSubmit}>
        <FieldSet types={data.types} data={data} />
        {data.size ? props.children : null}
    </form>
}

