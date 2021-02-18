import React, { useMemo, useState, useEffect } from 'react'

import { Color } from '/lib/base/color'
import { Point } from '/lib/base/point'


export function NumberField({name, label, value, ...props}) {
    const [number, setNumber] = useState(value)
    const handleChange = e => setNumber(Number(e.target.value))

    useEffect(() => setNumber(value), [value])
    return <Field type='number' label={label} value={value}>
        <input
            name={name}
            type='number'
            value={number}
            onChange={handleChange}
            {...props}
        />
    </Field>
}


export function TextField({name, label, value, ...props}) {
    console.log('started', name, value, props);
    const [text, setText] = useState(value)
    const handleChange = e => setText(String(e.target.value).trim())

    console.log("text: ", text);
    useEffect(() => {
        console.log('reset to', value);
        setText(value)
    }, [value])
    return <Field type='text' label={label}>
        <input
            name={name}
            type='text'
            value={text}
            onChange={handleChange}
            {...props}
        />
    </Field>
}


export function SelectField({name, label, value, ...props}) {
    const [selected, setSelected] = useState(value)

    function buildSelectOptions() {
        const _options = props.options.map(model => [model.name, model.label])
        return _options.map((option, index) => {
            const [value, label] = option
            return <option key={index} value={value}>{label}
            </option>
        })
    }
    useEffect(() => setSelected(value), [value])
    // console.log(name, label, value);
    return <Field type='select' label={label}>
        <select name={name} defaultValue={selected}>
            {useMemo(() => buildSelectOptions(), [value])}
        </select>
    </Field>
}


export function BooleanField({name, label, value}) {
    const [bool, setBool] = useState(value)
    const handleClick = () => setBool(!bool)

    useEffect(() => setBool(value), [value])
    return <Field type='boolean' label={label} status={bool}>
        <button type="button" onClick={handleClick}>{bool ? 'Yes' : 'No'}</button>
        <input name={name} type='hidden' value={String(bool)} />
    </Field>
}


export function ColorField({name, label, value, ...props}) {
    const [color, setColor] = useState(value)
    const [hexColor, setHexColor] = useState(value.toHex())
    const handleChange = event => {
        const hex = String(event.target.value).trim()
        setHexColor(hex)
        setColor(Color.fromHex(hex))
    }

    useEffect(() => {
        setColor(value)
        setHexColor(value.toHex())
    }, [value])

    return <Field type='color' label={label}>
        <span className="ColorView" style={{backgroundColor: color.toHex()}} />
        <input
            name={name}
            type='text'
            value={hexColor}
            onChange={handleChange}
            {...props}
        />
    </Field>
}


export function PointField({name, label, value, ...props}) {
    const [point, setPoint] = useState(value)
    const handleXChange = e => handleChange(e.target.value, point.y)
    const handleYChange = e => handleChange(point.x, e.target.value)
    const handleChange = (x, y) => setPoint(new Point(x, y))

    useEffect(() => setPoint(value), [value])
    return <Field type='point' label={label}>
        <input name={name} type='hidden' value={point.hash} />
        <input
            type='number'
            value={point.x}
            onChange={handleXChange}
            {...props}
        />
        <input
            type='number'
            value={point.y}
            onChange={handleYChange}
            {...props}
        />
    </Field>
}


export function FieldSet({types, data}) {
    return types.map((type, id) => {
        const FieldComponent = TYPE_FIELD_MAP[type.type]
        return <FieldComponent
            key={id}
            name={type.name}
            label={type.label}
            value={data.get(type.name)}
            {...type.props}
        />
    })
}


function Field({label, type, value, status='', children, ...props}) {
    return <label className={`Field ${type} ${status}`} {...props}>
        <span className='FieldLabel'>{label}</span>
        <span className='FieldValue'>{children}</span>
    </label>
}


export const TYPE_FIELD_MAP = {
    boolean: BooleanField,
    number: NumberField,
    text: TextField,
    color: ColorField,
    point: PointField,
    enum: SelectField,
}
