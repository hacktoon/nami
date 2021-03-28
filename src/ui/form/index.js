import React, { useState, useEffect } from 'react'

import { FieldSet } from './field'


export function Form({data, onSubmit, ...props}) {
    const [formData, setFormData] = useState(data.unparse())

    // detect updates to data
    useEffect(() => setFormData(data.unparse()), [data])

    const handleSubmit = event => {
        event.preventDefault()
        onSubmit(data.schema.parse(formData))
    }

    const handleChange = (name, value) => {
        const updatedData = formData.set(name, value)
        setFormData(updatedData)
        onSubmit(data.schema.parse(updatedData))
    }

    const className = `Form ${props.className}`
    return data.size > 0 && <form className={className} onSubmit={handleSubmit}>
        <FieldSet types={data.types} data={data} onChange={handleChange} />
        {props.children}
    </form>
}

