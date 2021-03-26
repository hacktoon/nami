import React, { useMemo, useState, useEffect } from 'react'

import { Color } from '/lib/base/color'
import { Point } from '/lib/base/point'


export function FieldSet({types, data}) {
    return types.map((type, id) => {
        const FieldComponent = TYPE_FIELD_MAP[type.type]
        const value = data.get(type.name)

        return <FieldComponent
            key={id}
            name={type.name}
            label={type.label}
            value={value}
            {...type.props}
        />
    })
}


function NumberField({name, label, value, ...props}) {
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


function TextField({name, label, value, ...props}) {
    const [text, setText] = useState(value)
    const handleChange = e => setText(String(e.target.value).trim())

    useEffect(() => setText(value), [value])
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


function SelectField({name, label, value, ...props}) {
    const [selected, setSelected] = useState(value)

    function buildSelectOptions() {
        const _options = props.options.map(model => [model.id, model.id])
        return _options.map((option, index) => {
            const [value, label] = option
            return <option key={index} value={value}>{label}
            </option>
        })
    }

    useEffect(() => setSelected(value), [value])
    return <Field type='select' label={label}>
        <select name={name} defaultValue={selected}>
            {useMemo(() => buildSelectOptions(), [value])}
        </select>
    </Field>
}


function BooleanField({name, label, value}) {
    const [bool, setBool] = useState(value)
    const handleClick = () => setBool(!bool)

    useEffect(() => setBool(value), [value])
    return <Field type='boolean' label={label} status={bool}>
        <button type="button" onClick={handleClick}>{bool ? 'Yes' : 'No'}</button>
        <input name={name} type='hidden' value={String(bool)} />
    </Field>
}


function ColorField({name, label, value, ...props}) {
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


function PointField({name, label, value, ...props}) {
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


function Field({label, type, value, status='', children, ...props}) {
    return <label className={`Field ${type} ${status}`} {...props}>
        <span className='FieldLabel'>{label}</span>
        <span className='FieldValue'>{children}</span>
    </label>
}


const TYPE_FIELD_MAP = {
    boolean: BooleanField,
    number: NumberField,
    text: TextField,
    color: ColorField,
    point: PointField,
    selection: SelectField,
}