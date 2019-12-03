import React from 'react'


// PUBLIC COMPONENTS ===============================================

export const TextInput = props => Input('text', props)

export const NumberInput = props => Input('number', props)

const Input = (type, props) => {
    const id = `${props.label}-${type}-field`
    const onChange = props.onChange && (event => props.onChange(event.target.value))
    const axis = getFieldAxis(props.axis)

    return <section className={`Field Field-${axis} Input`}>
        <label className="Label" htmlFor={id}>{props.label}</label>
        <input type={type} id={id} onChange={onChange} autocomplete="off" />
    </section>
}


export const OptionInput = props => {
    const id = `${props.label}-option-field`
    const onChange = props.onChange && (event => props.onChange(event.target.value))
    const axis = getFieldAxis(props.axis)

    const options = Object.entries(props.options).map((entry, index) => {
        const [value, label] = entry
        return <option key={index} value={value}>{label}</option>
    })

    return <section className={`Field Field-${axis} Select`}>
        <label className="Label" htmlFor={id}>{props.label}</label>
        <select id={id} value={props.value} onChange={onChange}>
            {options}
        </select>
    </section>
}


export function Output(props) {
    const axis = getFieldAxis(props.axis)

    return <section className={`Field Field-${axis}`}>
        <span className="Label">{props.label}</span>
        <output className="Label">{props.value}</output>
    </section>
}

function getFieldAxis(text) {
    return String(text).match(/^[VvHh]$/) || 'H'
}
