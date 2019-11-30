import React, { useState } from 'react'


export const TextField = props => Input('text', props)
export const NumberField = props => Input('number', props)


const Input = (type, props) => {
    const id = `${props.id}-${type}-field`
    const onChange = props.onChange && (event => props.onChange(event.target.value))

    return <Field id={id} label={props.label}>
        <input type={type} id={id} onChange={onChange} {...props} />
    </Field>
}

const Select = props => {
    const id = `${props.id}-select-field`
    const onChange = props.onChange && (event => props.onChange(event.target.value))

    return <Field id={id} label={props.label}>
        <select id={id} onChange={onChange} {...props}>
        {props.options.map((option, index) => {
            <option key={index} value={option}>{option}</option>
        })}
        </select>
    </Field>
}


export function Field(props) {
    return <section className="Field">
        <label htmlFor={props.id}>{props.label}</label>
        {props.children}
    </section>
}