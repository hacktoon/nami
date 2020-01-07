import React from 'react'


// HELPER FUNCTIONS ===============================================

function generateFieldID(type, props) {
    const id = props.label.toLowerCase().replace(/\s+/g, '-')
    return `${id}:${Number(new Date())}-${type}`
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
    const id = generateFieldID(type, props)
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
    const id = generateFieldID("select", props)

    function buildSelectOptions(options) {
        const entries = Object.entries(options)
        return entries.map((option, index) => {
            const [value, label] = option
            return <option key={index} value={value}>{label}</option>
        })
    }

    return <LabeledField id={id} label={props.label}>
        <select id={id} value={props.value} onChange={props.onChange}>
            {buildSelectOptions(props.options)}
        </select>
    </LabeledField>
}


export function OutputField(props) {
    return <section className="Field">
        <p className="label">{props.label}</p>
        <output className="value">{props.value}</output>
    </section>
}
