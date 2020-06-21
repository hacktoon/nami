import React, { useMemo, useState } from 'react'

import { Color } from '/lib/color'


export function BooleanField({ id, label, value, onChange, ...props }) {
    const [status, setStatus] = useState(Boolean(value))
    const onClick = () => {
        props.onChange(!status)
        setStatus(!status)
    }
    return <Field key={id} type='boolean' label={label} status={status}>
        <button onClick={onClick}>{status ? 'Yes' : 'No'}</button>
        <input type='checkbox' checked={status} onChange={()=>{}} {...props} />
    </Field>
}


export function NumberField({ id, value, label, onChange, ...props }) {
    const handleChange = event => onChange(Number(event.currentTarget.value))
    return <Field key={id} type='number' label={label} {...props}>
        <input type='number' defaultValue={value} onChange={handleChange} {...props} />
    </Field>
}


export function TextField({id, value, label, ...props }) {
    const onChange = event => props.onChange(String(event.currentTarget.value))
    return <Field key={id} type='text' label={label}>
        <input type='text' defaultValue={value} onChange={onChange} {...props} />
    </Field>
}


export function ColorField({id, value, label, ...props }) {
    const onChange = event => props.onChange(Color.fromHex(event.currentTarget.value))
    return <Field key={id} type='text' label={label}>
        <div className='ColorFieldValue'>
            <input type='text' defaultValue={value.toHex()} onChange={onChange} {...props} />
        </div>
    </Field>
}


export function SelectField({id, value, label, options, ...props }) {
    function buildSelectOptions(options) {
        const entries = Object.entries(options)
        return entries.map((option, index) => {
            const [value, label] = option
            return <option key={index} value={value}>{label}</option>
        })
    }
    return <Field key={id} type='select' label={label}>
        <select defaultValue={value} {...props}>
            {useMemo(() => buildSelectOptions(options), [options])}
        </select>
    </Field>
}

// TODO: remove
export function OutputField({ label, value }) {
    return <section className='Field'>
        <output className='FieldLabel'>{label}</output>
        <output className='FieldValue'>{value}</output>
    </section>
}


// BASE FIELD COMPONENT ===============================================

function Field({ label, type, status = '', children, ...props }) {
    return <label className={`Field ${type} ${status}`} {...props}>
        <span className='FieldLabel'>{label}</span>
        <span className='FieldValue'>{children}</span>
    </label>
}


// HELPER FUNCTIONS ===============================================

export function buildFields(fields) {
    return fields.map(({ type, ...props }, id) => {
        const FieldComponent = TYPE_FIELD_MAP[type]
        return FieldComponent({ id, onChange: () => { }, ...props })
    })
}

const TYPE_FIELD_MAP = {
    boolean: BooleanField,
    number: NumberField,
    text: TextField,
    color: ColorField,
}