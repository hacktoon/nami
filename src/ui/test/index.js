import React, { useState } from 'react'

import { Schema, Type } from '/lib/schema'
import { Form } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import { Point } from '/lib/point'
import { Color } from '/lib/color'


const mapSchema = new Schema(
    Type.point('focus', 'Focus', new Point(5, 2)),
    Type.boolean('active', 'Active', false),
    Type.text('seed', 'Seed', ''),
    Type.number('count', 'Count', 4),
    Type.color('bg', 'BG color', new Color(230, 35, 66)),
)


export function TestApp() {
    const [data, setData] = useState(mapSchema.defaultValues())

    return <section className='TestApp'>
        <Form
            className="TestForm"
            onSubmit={setData}
            schema={mapSchema}
            data={data}>
            <Button label="New" />
        </Form>
    </section>
}