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

function Field(props) {
    return <section className={cls(props.className, 'Field')}>
        <label className='FieldLabel' htmlFor={props.id}>{props.label}</label>
        {props.children}
    </section>
}


function InputField({type, label, className, ...props}) {
    let id = generateFieldID(label)
    let _class = cls('FieldValue', className)
    return <Field id={id} label={label}>
        <input id={id} type={type} className={_class} {...props} />
    </Field>
}


export function SelectField({className, ...props}) {
    const {label, options, ...restProps} = props
    const children = useMemo(() => buildSelectOptions(options), [options])
    const id = generateFieldID(label)
    let _class = cls('FieldValue', className)

    return <Field id={id} label={label}>
        <select id={id} className={_class} {...restProps}>
            {children}
        </select>
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


export function BooleanField(props) {
    let {label, className, ...restProps} = props
    let enabled = props.checked ? 'Yes' : 'No'
    let _className = cls(props.className, 'Field')
    let onClick = event => restProps.onChange(event.target.checked)
    return <section onClick={onClick} className={_className} {...restProps}>
            <div className='FieldLabel'>{props.label}</div>
            <div className={cls('FieldValue', 'CheckBox', enabled)}>{enabled}</div>
    </section>
}


export function OutputField(props) {
    return <section className='Field'>
        <output className='FieldLabel'>{props.label}</output>
        <output className='FieldValue'>{props.value}</output>
    </section>
}
