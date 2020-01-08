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

function LabeledField(props) {
    const className = 'Field'
    const label = props.label || className
    return <section className={className}>
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
    const children = useMemo(() => buildSelectOptions(options), [options])
    const id = generateFieldID(label)

    return <LabeledField id={id} label={label}>
        <select id={id} {...selectProps}>
            {children}
        </select>
    </LabeledField>
}


export function OutputField(props) {
    return <section className="Field">
        <p className="label">{props.label}</p>
        <output className="value">{props.value}</output>
    </section>
}
