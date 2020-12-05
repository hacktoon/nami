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


export function TestUI() {
    const [data, setData] = useState(mapSchema.defaultValues())

    const handleSubmit = data => {
        setData(data)
    }

    return <section className='TestUI'>
        <Form
            className="TestForm"
            onSubmit={handleSubmit}
            schema={mapSchema}
            data={data}>
            <Button label="New" />
        </Form>
    </section>
}