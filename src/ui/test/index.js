import React, { useState } from 'react'

import { Schema, Type } from './schema'
import { Form2 } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import { Point } from '/lib/point'
import { Color } from '/lib/color'


const mapSchema = new Schema(
    Type.point('focus', 'Focus', new Point(5, 2)),
    Type.boolean('active', 'Active', false),
    Type.text('seed', 'Seed', ''),
    Type.color('bg', 'BG color', new Color(230, 35, 66)),
)


export function TestApp() {
    const [data, setData] = useState(mapSchema.defaults())

    const setConfig = data => {
        console.log(data);
        setData(data)
    }

    return <section className='TestApp'>
        <Form2
            className="TestForm"
            onSubmit={setConfig}
            schema={mapSchema}
            data={data}>
            <Button label="New" />
        </Form2>
    </section>
}