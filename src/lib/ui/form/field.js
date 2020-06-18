import React, { useMemo } from 'react'

import { Color } from '/lib/color'


// HELPER FUNCTIONS ===============================================

function buildSelectOptions(options) {
    const entries = Object.entries(options)
    return entries.map((option, index) => {
        const [value, label] = option
        return <option key={index} value={value}>{label}</option>
    })
}


export function buildFields(fields) {
    return fields.map(({type, ...props}, key) => type({key, ...props}))
}


// GENERIC FIELD ===============================================

function Field({label, type, status='', children}) {
    const slug = label.toLowerCase().replace(/\s+/g, '')
    const id = `${slug}-field-${Number(new Date())}`

    return <label htmlFor={id} className={`Field ${type} ${status}`}>
        <span className='FieldLabel'>{label}</span>
        <div className='FieldValue'>{children(id)}</div>
    </label>
}


// SPECIAL GENERIC FIELDS ===============================================

function OptionalField({label, type, ...props}) {
    const value = Boolean(props.value)
    return <Field type={type} label={label} status={String(value)}>
        {id => <input id={id} type={type} defaultChecked={value} {...props} />}
    </Field>
}


export function InputField({value, label, type, ...props}) {
    return <Field type={type} label={label}>
        {id => <input id={id} type={type} defaultValue={value} {...props} />}
    </Field>
}


export function SelectField({label, options, ...props}) {
    const children = useMemo(() => buildSelectOptions(options), [options])
    return <Field type='select' label={label}>
        {id => <select id={id} {...props}>{children}</select>}
    </Field>
}


// FIELD COMPONENTS ===============================================

export function ColorField({value, ...props}) {
    return <TextField value={value.toHex()} {...props} />
}


export const BooleanField = props => <OptionalField type='checkbox' {...props} />


export const TextField = props => <InputField type='text' {...props}/>


export const NumberField = props => <InputField type='number' {...props} />


export function OutputField(props) {
    return <section className='Field'>
        <output className='FieldLabel'>{props.label}</output>
        <output className='FieldValue'>{props.value}</output>
    </section>
}