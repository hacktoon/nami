import React, { useMemo } from 'react'


// HELPER FUNCTIONS ===============================================

function generateFieldID(text) {
    // create unique id based on current timestamp
    const id = text.toLowerCase().replace(/\s+/g, '-')
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
    const label = String(props.label || '')
    return <section className="Field">
        <label htmlFor={props.id}>{label}</label>
        {props.children}
    </section>
}

function InputField(type, props) {
    const {label, ...inputProps} = props
    const id = generateFieldID(label)
    return <LabeledField id={id} label={label}>
        <input id={id} type={type} {...inputProps} />
    </LabeledField>
}


// PUBLIC COMPONENTS ===============================================

export function TextField(props) {
    return InputField('text', props)
}

export function NumberField(props) {
    return InputField('number', props)
}


export function SelectField(props) {
    const {label, options, ...selectProps} = props
    const childOptions = useMemo(() => buildSelectOptions(options), [options])
    const id = generateFieldID(label)

    return <LabeledField id={id} label={label}>
        <select id={id} {...selectProps}>
            {childOptions}
        </select>
    </LabeledField>
}


export function OutputField(props) {
    return <section className="Field">
        <p className="label">{props.label}</p>
        <output className="value">{props.value}</output>
    </section>
}
