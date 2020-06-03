import React, { useMemo } from 'react'


import { cls } from '/lib/ui'


// HELPER FUNCTIONS ===============================================

function generateFieldID(label) {
    // create unique id based on label and current timestamp
    const id = label.toLowerCase().replace(/\s+/g, '-')
    const hash = new Date().valueOf() / Math.random()
    return `${id}Field${hash}`
}

function buildSelectOptions(options) {
    const entries = Object.entries(options)
    return entries.map((option, index) => {
        const [value, label] = option
        return <option key={index} value={value}>{label}</option>
    })
}


// GENERIC FIELDS ===============================================

function Field({label, className, children}) {
    let id = generateFieldID(label)
    return <section className={cls(className, 'Field')}>
        <label className='FieldLabel' htmlFor={id}>{label}</label>
        <div id={id} className='FieldValue' >{children}</div>
    </section>
}


function InputField({type, label, ...props}) {
    return <Field label={label}>
        <input type={type} {...props} />
    </Field>
}


export function SelectField({label, options, ...props}) {
    const children = useMemo(() => buildSelectOptions(options), [options])
    return <Field label={label}>
        <select {...props}>{children}</select>
    </Field>
}


// PUBLIC COMPONENTS ===============================================

export function TextField(props) {
    return <InputField type='text' {...props} />
}


export function NumberField({onChange, ...props}) {
    const _onChange = event => onChange({
        value: Math.max(props.min, Number(event.target.value)),
        event,
    })
    return <InputField type='number' onChange={_onChange} {...props} />
}


export function BooleanField({onChange, ...props}) {
    let _onChange = event => onChange(event.target.checked)
    return <InputField
        type='checkbox'
        onChange={_onChange}
        checked={props.checked}
        {...props}
    />
}


export function OutputField(props) {
    return <section className='Field'>
        <output className='FieldLabel'>{props.label}</output>
        <output className='FieldValue'>{props.value}</output>
    </section>
}
