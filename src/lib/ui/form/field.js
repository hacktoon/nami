import React, { useMemo, useState } from 'react'


export function NumberField({id, label, defaultValue, onChange, ...props}) {
    const handleChange = event => onChange(props.name, event.currentTarget.value)

    return <Field key={id} type='number' label={label} {...props}>
        <input
            type='number'
            defaultValue={defaultValue}
            onChange={handleChange}
            {...props}
        />
    </Field>
}


export function TextField({id, label, defaultValue, onChange, ...props}) {
    const handleChange = event => onChange(props.name, event.currentTarget.value)

    return <Field key={id} type='text' label={label}>
        <input
            type='text'
            defaultValue={defaultValue}
            onChange={handleChange}
            {...props}
        />
    </Field>
}


export function SelectField({id, label, defaultValue, onChange, options, ...props}) {
    const handleChange = event => onChange(props.name, event.currentTarget.value)

    function buildSelectOptions(options) {
        const entries = Object.entries(options)
        return entries.map((option, index) => {
            const [value, label] = option
            return <option key={index} value={value}>{label}</option>
        })
    }

    return <Field key={id} type='select' label={label}>
        <select defaultValue={defaultValue} {...props} onChange={handleChange}>
            {useMemo(() => buildSelectOptions(options), [options])}
        </select>
    </Field>
}


export function BooleanField({id, label, defaultValue, onChange, ...props}) {
    const [status, setStatus] = useState(defaultValue)
    const onClick = () => {
        onChange(props.name, !status)
        setStatus(!status)
    }

    return <Field key={id} type='boolean' label={label} status={status}>
        <button onClick={onClick}>{status ? 'Yes' : 'No'}</button>
        <input type='checkbox' checked={status} onChange={()=>{}} {...props} />
    </Field>
}


export function ColorField({id, label, defaultValue, onChange, ...props}) {
    const [color, setColor] = useState(defaultValue)
    const handleChange = event => {
        const newColor = event.currentTarget.value
        setColor(newColor)
        onChange(props.name, newColor)
    }

    return <Field key={id} type='color' label={label}>
        <span className="ColorView" style={{backgroundColor: color}}></span>
        <input
            type='text'
            defaultValue={color}
            onChange={handleChange}
            {...props}
        />
    </Field>
}


// BASE FIELD COMPONENT ===============================================

function Field({label, type, status = '', children, ...props}) {
    return <label className={`Field ${type} ${status}`} {...props}>
        <span className='FieldLabel'>{label}</span>
        <span className='FieldValue'>{children}</span>
    </label>
}


export const TYPE_FIELD_MAP = {
    boolean: BooleanField,
    number: NumberField,
    text: TextField,
    color: ColorField
}