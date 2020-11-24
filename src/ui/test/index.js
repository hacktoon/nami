import React, { useState } from 'react'

import { Schema, Type } from './schema'
import { Form2 } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import {
    PointField2,
    BooleanField2,
    SeedField2,
    ColorField2
} from '/lib/ui/form/field'
import { Point } from '/lib/point'
import { Color } from '/lib/color'


// const MapSchema = Schema.create(
//     Type.number("Width", 200, {min: 1, max: 256}),
//     Type.number("Height", 150, {min: 1, max: 256}),
// )


export function TestApp() {
    const [formData, setFormData] = useState(new Map([
        ['focus', new Point(5, 2)],
        ['active', false],
        ['seed', ''],
        ['bgColor', new Color(230, 35, 66)],
    ]))

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
                value={formData.get('bgColor')}
            />

            <BooleanField2
                name='active'
                label='Active'
                value={formData.get('active')}
            />
            <SeedField2
                name='seed'
                label='Seed'
                value={formData.get('seed')}
            />

            <PointField2
                name='focus'
                label='Focus'
                value={formData.get('focus')}
            />
            <Button label="New" />
        </Form2>
    </section>
}