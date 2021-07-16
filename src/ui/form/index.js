import React, { useState, useEffect } from 'react'

import { FieldSet } from './field'


export function Form({data, onSubmit, ...props}) {
    const [formData, setFormData] = useState(data)

    // detect updates to `data` prop
    useEffect(() => setFormData(data), [data])

    const handleSubmit = event => {
        event.preventDefault()
        const updatedData = formData.clone()
        setFormData(updatedData)
        onSubmit(updatedData)
    }

    const handleChange = (name, value) => {
        const updatedData = formData.update(name, value)
        setFormData(updatedData)
        onSubmit(updatedData)
    }

    const className = `Form ${props.className}`
    return data.size > 0 && <form className={className} onSubmit={handleSubmit}>
        <FieldSet types={formData.types} data={formData} onChange={handleChange} />
        {props.children}
    </form>
}


function getDefaultData(schemaInstance) {
    const key = schemaInstance.name
    if (FormCache.has(key)) {
        return FormCache.read(key)
    }
    return schemaInstance
}


export class FormCache {
    static save(name, formData) {
        const text = JSON.stringify([...formData])
        window.localStorage.setItem(name, text)
    }

    static has(name) {
        return window.localStorage.getItem(name) !== null
    }

    static read(name) {
        const cacheData = window.localStorage.getItem(name)
        return new Map(JSON.parse(cacheData))
    }
}
window.FormCache = FormCache