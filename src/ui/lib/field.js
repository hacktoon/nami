import React from 'react'


export function Field(props) {
    const align = props.align
    return <section className="Field">
        <label htmlFor="viewInput">{props.label}</label>
        {props.children}
    </section>
}


export function TextField(props) {
    return <Field label={props.label}>
        <input type="text"
            onChange={props.onChange}
            value={props.value}
        />
    </Field>
}