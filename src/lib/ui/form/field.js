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
    const id = generateFieldID(label)
    return <section className={`Field ${type}`}>
        <label className='FieldLabel' htmlFor={id}>{label}</label>
        <div className='FieldValue'>{children(id)}</div>
    </section>
}


function OptionalField({label, type, ...props}) {
    const id = generateFieldID(label)
    const checked = Boolean(props.value)
    return <label className={`Field ${type} ${String(checked)}`} htmlFor={id}>
        <span className='FieldLabel'>{label}</span>
        <span className='FieldValue'>
            <input id={id} type={type} className='hidden' checked={checked} {...props} />
        </span>
    </label>
}


function InputField({label, type, ...props}) {
    return <Field type={type} label={label}>
        {id => <input id={id} type={type} {...props} />}
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


export function SelectField({label, options, ...props}) {
    const children = useMemo(() => buildSelectOptions(options), [options])
    return <Field type='select' label={label}>
        {id => <select id={id} {...props}>{children}</select>}
    </Field>
}


export function BooleanField({onChange, ...props}) {
    const _onChange = event => onChange(Boolean(event.target.checked))
    return <OptionalField type='checkbox' onChange={_onChange} {...props} />
}


export function OutputField(props) {
    return <section className='Field'>
        <output className='FieldLabel'>{props.label}</output>
        <output className='FieldValue'>{props.value}</output>
    </section>
}
