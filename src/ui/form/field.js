import React, { useMemo, useState, useEffect } from 'react'

import { Rect } from '/src/lib/number'
import { Color } from '/src/lib/color'
import { Point } from '/src/lib/point'


export function FieldSet({types, data, onChange}) {
    return types.map((type, id) => {
        const FieldComponent = TYPE_FIELD_MAP[type.type]
        const value = data.get(type.name)

        return <FieldComponent
            key={id}
            name={type.name}
            label={type.label}
            onChange={onChange}
            value={value}
            {...type.props}
        />
    })
}


function NumberField({name, label, value, onChange, ...props}) {
    const [number, setNumber] = useState(value)
    const handleChange = e => {
        const inputValue = Number(e.target.value)
        setNumber(inputValue)
        onChange(name, inputValue)
    }

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


function TextField({name, label, value, onChange, ...props}) {
    const [text, setText] = useState(value)
    const handleChange = e => {
        const inputValue = String(e.target.value)
        setText(inputValue)
        onChange(name, inputValue)
    }

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


function SelectField({name, label, value, onChange, ...props}) {
    const [selected, setSelected] = useState(value)

    const buildSelectOptions = () => {
        const _options = props.options.map(model => [model.id, model.id])
        return _options.map((option, index) => {
            const [value, label] = option
            return <option key={index} value={value}>
                {label}
            </option>
        })
    }

    const handleChange = event => onChange(name, event.target.value)

    useEffect(() => setSelected(value), [value])
    return <Field type='select' label={label}>
        <select name={name} defaultValue={selected} onChange={handleChange}>
            {useMemo(() => buildSelectOptions(), [value])}
        </select>
    </Field>
}


function BooleanField({name, label, value, onChange}) {
    const [bool, setBool] = useState(value)
    const handleClick = () => {
        onChange(name, String(!bool))
        setBool(!bool)
    }

    useEffect(() => setBool(value), [value])
    return <Field type='boolean' label={label} status={bool}>
        <button type="button" onClick={handleClick}>{bool ? 'Yes' : 'No'}</button>
        <input name={name} type='hidden' value={String(bool)} />
    </Field>
}


function ColorField({name, label, value, onChange, ...props}) {
    const [color, setColor] = useState(value)
    const [hexColor, setHexColor] = useState(value.toHex())
    const handleChange = event => {
        const hex = String(event.target.value)
        setHexColor(hex)
        setColor(Color.fromHex(hex))
        onChange(name, hex)
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


function PointField({name, label, value, onChange, ...props}) {
    const [point, setPoint] = useState(value)
    const handleXChange = e => handleChange(e.target.value, point[1])
    const handleYChange = e => handleChange(point[0], e.target.value)
    const handleChange = (x, y) => {
        const point = [x, y]
        onChange(name, Point.hash(point))
        setPoint(point)
    }

    useEffect(() => setPoint(value), [value])
    return <Field type='point' label={label}>
        <div className="coordinate">
            <span>x</span>
            <input
                type='number'
                value={point[0]}
                onChange={handleXChange}
                {...props}
            />
        </div>
        <div className="coordinate">
            <span>y</span>
            <input
                type='number'
                value={point[1]}
                onChange={handleYChange}
                {...props}
            />
        </div>
    </Field>
}


function RectField({name, label, value, onChange, ...props}) {
    const [rect, setRect] = useState(value)
    const handleWidthChange = e => handleChange(e.target.value, rect.height)
    const handleHeightChange = e => handleChange(rect.width, e.target.value)
    const handleChange = (width, height) => {
        const rect = new Rect(width, height)
        onChange(name, rect.hash())
        setRect(rect)
    }

    useEffect(() => setRect(value), [value])
    return <Field type='rect' label={label}>
        <input
            type='number'
            value={rect.width}
            onChange={handleWidthChange}
        />
        <span className="separator">x</span>
        <input
            type='number'
            value={rect.height}
            onChange={handleHeightChange}
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
    rect: RectField,
}
