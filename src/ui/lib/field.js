import React, { useMemo } from 'react'

import { cls } from '/ui/lib'

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

function LabeledField(props) {
    return <section className={cls(props.className, 'Field')}>
        <label className='Label' htmlFor={props.id}>{props.label}</label>
        {props.children}
    </section>
}

function LabeledInputField(type, props) {
    const id = generateFieldID(props.label)
    const {label, ...inputProps} = props
    return <LabeledField id={id} label={label}>
        <input id={id} type={type} {...inputProps} />
    </LabeledField>
}


// PUBLIC COMPONENTS ===============================================

export function TextField(props) {
    return LabeledInputField('text', props)
}

export function NumberField(props) {
    return LabeledInputField('number', props)
}


export function SelectField(props) {
    const {label, options, ...selectProps} = props
    const children = useMemo(() => buildSelectOptions(options), [options])
    const id = generateFieldID(label)

    return <LabeledField id={id} label={label}>
        <select id={id} {...selectProps}>
            {children}
        </select>
    </LabeledField>
}


export function OutputField(props) {
    return <section className='Field'>
        <output className='Label'>{props.label}</output>
        <output className='Value'>{props.value}</output>
    </section>
}
