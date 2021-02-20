import React from 'react'

import { FieldSet } from './field'


export function Form({data, schema, onSubmit, ...props}) {
    const handleSubmit = event => {
        event.preventDefault()
        const params = schema.parseForm(event.target.elements)
        onSubmit(params)
    }

    return <form className={`Form ${props.className}`} onSubmit={handleSubmit}>
        <FieldSet types={schema.types} data={data} />
        {data.size ? props.children : null}
    </form>
}

