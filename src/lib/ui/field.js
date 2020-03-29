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

function LabeledField(props) {
    return <section className={cls(props.className, 'Field')}>
        <label className='FieldLabel' htmlFor={props.id}>{props.label}</label>
        {props.children}
    </section>
}

function LabeledInputField(type, props) {
    let id = generateFieldID(props.label)
    let {label, className, ...restProps} = props
    let _class = cls('FieldValue', className)
    return <LabeledField id={id} label={label}>
        <input id={id} type={type} className={_class} {...restProps} />
    </LabeledField>
}

// PUBLIC COMPONENTS ===============================================

export function TextField(props) {
    return LabeledInputField('text', props)
}


export function SwitchField(props) {
    return LabeledInputField('checkbox', props)
}


export function NumberField(props) {
    return LabeledInputField('number', props)
}


export function SelectField({className, ...props}) {
    const {label, options, ...restProps} = props
    const children = useMemo(() => buildSelectOptions(options), [options])
    const id = generateFieldID(label)
    let _class = cls('FieldValue', className)

    return <LabeledField id={id} label={label}>
        <select id={id} className={_class} {...restProps}>
            {children}
        </select>
    </LabeledField>
}


export function OutputField(props) {
    return <section className='Field'>
        <output className='FieldLabel'>{props.label}</output>
        <output className='FieldValue'>{props.value}</output>
    </section>
}
