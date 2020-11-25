import React, { useState } from 'react'

import { Schema, Type } from './schema'
import { Form2 } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import {
    PointField2,
    BooleanField2,
    TextField2,
    ColorField2
} from '/lib/ui/form/field'
import { Point } from '/lib/point'
import { Color } from '/lib/color'


const mapSchema = new Schema(
    Type.point('focus', 'Focus', new Point(5, 2)),
    Type.boolean('active', 'Active', false),
    Type.text('seed', 'Seed', ''),
    Type.color('bg', 'BG color', new Color(230, 35, 66)),
)


export function TestApp() {
    const defaults = mapSchema.defaults()
    console.log(defaults);
    const [formData, setFormData] = useState(defaults)

    const setConfig = data => {
        console.log(data);
        setFormData(data)
    }

    return <section className='TestApp'>
        <Form2
            className="TestForm"
            onSubmit={setConfig}
            data={formData}>

            <ColorField2
                name='bgColor'
                label='BG Color'
                defaultValue={formData.get('bg')}
            />

            <BooleanField2
                name='active'
                label='Active'
                defaultValue={formData.get('active')}
            />
            <TextField2
                name='seed'
                label='Seed'
                defaultValue={formData.get('seed')}
            />

            <PointField2
                name='focus'
                label='Focus'
                defaultValue={formData.get('focus')}
            />
            <Button label="New" />
        </Form2>
    </section>
}