import { React, useState, useEffect } from 'react'
import { FieldSet } from './field'


export function Form({data, onSubmit, ...props}) {
    const [formData, setFormData] = useState(data)
    // detect updates to `data` prop
    useEffect(() => setFormData(data), [data])

    const handleSubmit = event => {
        event.preventDefault()
        const updatedData = formData.clone()
        updatedData.persist()
        setFormData(updatedData)
        onSubmit(updatedData)
    }

    const handleChange = (name, value) => {
        const updatedData = formData.update(name, value)
        updatedData.persist()
        setFormData(updatedData)
        onSubmit(updatedData)
    }

    const className = `Form ${props.className ?? ''}`
    return data.size > 0 && <form className={className} onSubmit={handleSubmit}>
        <FieldSet types={formData.types} data={formData} onChange={handleChange} />
        {props.children}
    </form>
}