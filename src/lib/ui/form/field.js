import React, { useMemo, useState } from 'react'

import { Color } from '/lib/color'


export function NumberField({id, value, label, onChange, ...props}) {
    const handleChange = event => onChange(props.name, Number(event.currentTarget.value))
    return <Field key={id} type='number' label={label} {...props}>
        <input type='number' defaultValue={value} onChange={handleChange} {...props} />
    </Field>
}


export function TextField({id, value, label, onChange, ...props}) {
    const handleChange = event => onChange(props.name, String(event.currentTarget.value).trim())
    return <Field key={id} type='text' label={label}>
        <input type='text' defaultValue={value} {...props} onChange={handleChange} />
    </Field>
}


export function SelectField({id, value, label, onChange, options, ...props}) {
    function buildSelectOptions(options) {
        const entries = Object.entries(options)
        return entries.map((option, index) => {
            const [value, label] = option
            return <option key={index} value={value}>{label}</option>
        })
    }
    const handleChange = event => onChange(props.name, event.currentTarget.value)
    return <Field key={id} type='select' label={label}>
        <select defaultValue={value} {...props} onChange={handleChange}>
            {useMemo(() => buildSelectOptions(options), [options])}
        </select>
    </Field>
}


export function BooleanField({id, label, value, onChange, ...props}) {
    const [status, setStatus] = useState(Boolean(value))
    const onClick = () => {
        onChange(props.name, !status)
        setStatus(!status)
    }
    return <Field key={id} type='boolean' label={label} status={status}>
        <button onClick={onClick}>{status ? 'Yes' : 'No'}</button>
        <input type='checkbox' checked={status} onChange={()=>{}} {...props} />
    </Field>
}


export function ColorField({id, value, label, onChange, ...props}) {
    const [color, setColor] = useState(value)
    const handleChange = event => {
        const newColor = Color.fromHex(event.currentTarget.value)
        onChange(props.name, newColor)
        setColor(newColor)
    }
    return <Field key={id} type='color' label={label}>
        <span className="ColorView" style={{backgroundColor: color.toHex()}}></span>
        <input type='text' defaultValue={color.toHex()} onChange={handleChange} {...props} />
    </Field>
}


// BASE FIELD COMPONENT ===============================================

function Field({ label, type, status = '', children, ...props}) {
    return <label className={`Field ${type} ${status}`} {...props}>
        <span className='FieldLabel'>{label}</span>
        <span className='FieldValue'>{children}</span>
    </label>
}


export const TYPE_FIELD_MAP = {
    boolean: BooleanField,
    number: NumberField,
    text: TextField,
    color: ColorField,
}