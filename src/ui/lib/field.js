import React from 'react'


function normalizeText(text) {
    return text.toLowerCase().replace(/\s+/g, '-')
}

function buildSelectOptions(options) {
    const entries = Object.entries(options)
    return entries.map((option, index) => {
        const [value, label] = option
        return <option key={index} value={value}>{label}</option>
    })
}

function EditableField(props) {
    const label = String(props.label || '')
    return <section className="Field">
        <label htmlFor={props.id}>{props.label}</label>
        {props.children}
    </section>
}

function InputField(type, props) {
    const id = `${normalizeText(props.label)}-input-field`
    return <EditableField id={id} label={props.label}>
        <input id={id} type={type} {...props} />
    </EditableField>
}


// PUBLIC COMPONENTS ===============================================

export const TextField = props => InputField('text', props)

export const NumberField = props => InputField('number', props)

export function SelectField(props) {
    const id = `${normalizeText(props.label)}-select-field`
    return <EditableField id={id} label={props.label}>
        <select id={id} value={props.value} onChange={props.onChange}>
            {buildSelectOptions(props.options)}
        </select>
    </EditableField>
}

export function OutputField(props) {
    return <section className="Field">
        <p className="label">{props.label}</p>
        <output className="value">{props.value}</output>
    </section>
}
