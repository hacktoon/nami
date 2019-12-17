import React from 'react'


// PUBLIC COMPONENTS ===============================================

export const TextField = props => InputField('text', props)

export const NumberField = props => InputField('number', props)

const InputField = (type, props) => {
    const id = `${props.label}-${type}-input-field`
    const onChange = props.onChange && (event => props.onChange(event.target.value))

    return <Field htmlFor={id} label={props.label}>
        <input type={type} id={id} onChange={onChange} autoComplete="off" />
    </Field>
}


export const MultiOptionField = props => {
    const id = `${props.label}-multi-option-field`
    const onChange = props.onChange && (event => props.onChange(event.target.value))

    const options = Object.entries(props.options).map((option, index) => {
        const [value, label] = option
        return <option key={index} value={value}>{label}</option>
    })

    return <Field htmlFor={id} label={props.label}>
        <select id={id} value={props.value} onChange={onChange}>
            {options}
        </select>
    </Field>
}


export function OutputField(props) {
    return <Field label={props.label}>
        <output className="Value">{props.value}</output>
    </Field>
}

export function Field(props) {
    const label = String(props.label)

    return <section className="Field">
        {label}
        {props.children}
    </section>
}

{/*

GridLayout
ListLayout
    align="vertical|horizontal"
FlowLayout
CardLayout
    default=<Component>

==============================================
OutputField
    label
    value

BooleanField
FloatField
IntField
TextField
    default
    label
    value

AnyOptionField
MultiOptionField
    options
    default
    label

FieldSet
Form

*/}