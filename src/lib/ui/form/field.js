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


// GENERIC FIELD ===============================================

function Field({label, type, status='', children}) {
    const slug = label.toLowerCase().replace(/\s+/g, '')
    const id = `${slug}-field-${Number(new Date())}`

    return <label className={`Field ${type} ${status}`}>
        <span className='FieldLabel' htmlFor={id}>{label}</span>
        <div className='FieldValue'>{children(id)}</div>
    </label>
}


// SPECIAL GENERIC FIELDS ===============================================

function OptionalField({label, type, ...props}) {
    const checked = Boolean(props.value)
    return <Field type={type} label={label} status={String(checked)}>
        {id => <input id={id} type={type} checked={checked} {...props} />}
    </Field>
}


function InputField({label, type, ...props}) {
    return <Field type={type} label={label}>
        {id => <input id={id} type={type} {...props} />}
    </Field>
}


// FIELD COMPONENTS ===============================================

export function ColorField({onChange, value, ...props}) {
    return <InputField type="text"
        onChange={event => onChange({
            value: Color.fromHex(event.target.value),
            event
        })}
        defaultValue={value.toHex()}
        {...props}
    />
}


export function BooleanField({onChange, ...props}) {
    return <OptionalField type='checkbox'
        onChange={event => onChange({value: event.target.checked, event})}
        {...props}
    />
}


export function TextField({onChange, ...props}) {
    return <InputField type='text'
        onChange={event => onChange({value: String(event.target.value), event})}
        {...props}
    />
}


export function NumberField({onChange, ...props}) {
    let value = event => Math.max(props.min, Number(event.target.value))
    return <InputField type='number'
        onChange={event => onChange({value: value(event), event})}
        {...props}
    />
}


export function SelectField({label, options, ...props}) {
    const children = useMemo(() => buildSelectOptions(options), [options])
    return <Field type='select' label={label}>
        {id => <select id={id} {...props}>{children}</select>}
    </Field>
}


export function OutputField(props) {
    return <section className='Field'>
        <output className='FieldLabel'>{props.label}</output>
        <output className='FieldValue'>{props.value}</output>
    </section>
}