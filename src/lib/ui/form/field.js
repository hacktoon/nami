import React, { useMemo, useState, useRef } from 'react'

import { Color } from '/lib/color'
import { Point } from '/lib/point'


export function NumberField({name, label, defaultValue, ...props}) {
    return <Field type='number' label={label} value={defaultValue}>
        <input
            name={name}
            type='number'
            defaultValue={defaultValue}
            {...props}
        />
    </Field>
}


export function TextField({name, label, defaultValue, ...props}) {
    return <Field type='text' label={label}>
        <input
            name={name}
            type='text'
            defaultValue={defaultValue}
            {...props}
        />
    </Field>
}


export function SelectField({name, label, value, onChange, options, ...props}) {
    const handleChange = event => onChange(name, event.target.value)

    function buildSelectOptions(options) {
        const entries = Object.entries(options)
        return entries.map((option, index) => {
            const [value, label] = option
            return <option key={index} value={value}>{label}</option>
        })
    }

    return <Field type='select' label={label}>
        <select name={name} defaultValue={value} {...props} onChange={handleChange}>
            {useMemo(() => buildSelectOptions(options), [options])}
        </select>
    </Field>
}


export function BooleanField({name, label, defaultValue, onChange}) {
    const [status, setStatus] = useState(defaultValue)

    const onClick = () => setStatus(!status)

    return <Field type='boolean' label={label} status={status}>
        <button type="button" onClick={onClick}>{status ? 'Yes' : 'No'}</button>
        <input name={name} type='hidden' value={String(status)} />
    </Field>
}


export function ColorField({name, label, defaultValue, ...props}) {
    const [color, setColor] = useState(defaultValue)

    const handleChange = event => {
        setColor(Color.fromHex(event.target.value))
    }

    return <Field type='color' label={label}>
        <span
            className="ColorView"
            style={{backgroundColor: color.toHex()}}>
        </span>
        <input
            name={name}
            type='text'
            defaultValue={color.toHex()}
            onChange={handleChange}
            {...props}
        />
    </Field>
}


export function PointField({name, label, defaultValue, ...props}) {
    const [point, setPoint] = useState(defaultValue)
    const handleXChange = e => handleChange(e.target.value, point.y)
    const handleYChange = e => handleChange(point.x, e.target.value)
    const handleChange = (x, y) => setPoint(new Point(x, y))

    return <Field type='point' label={label}>
        <input name={name} type='hidden' value={point.hash} />
        <input
            type='number'
            defaultValue={point.x}
            onChange={handleXChange}
            {...props}
        />
        <input
            type='number'
            defaultValue={point.y}
            onChange={handleYChange}
            {...props}
        />
    </Field>
}


// BASE FIELD COMPONENT ===============================================

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
}
