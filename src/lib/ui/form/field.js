import React, { useMemo } from 'react'


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

function Field({label, type, children}) {
    let id = generateFieldID(label)
    return <section className={`Field ${type}`}>
        <label className='FieldLabel' htmlFor={id}>{label}</label>
        <div className='FieldValue'>{children(id)}</div>
    </section>
}


function InputField({label, type, ...props}) {
    return <Field type={type} label={label}>
        {id => <input id={id} type={type} {...props} />}
    </Field>
}


export function SelectField({label, options, ...props}) {
    const children = useMemo(() => buildSelectOptions(options), [options])
    return <Field type={'select'} label={label}>
        {id => <select id={id} {...props}>{children}</select>}
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
