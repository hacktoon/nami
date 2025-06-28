import { useState } from 'react'

import { Point } from '/src/lib/geometry/point'
import { Form } from '/src/ui/form'
import { Button } from '/src/ui/form/button'
import { Text } from '/src/ui'


const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const hasBlack = {
    'C': ['C#', 'Db'],
    'D': ['D#', 'Eb'],
    'F': ['F#', 'Gb'],
    'G': ['G#', 'Ab'],
    'A': ['A#', 'Bb']
}
const octaves = [1, 2, 3, 4, 5]


export function UIAudioSynth({modelClass}) {
    // const [data, setData] = useState(modelClass.schema.build())
    // const tileMap = modelClass.create(data)

    return <section className='UIAudioSynth'>
        <Keyboard />
        {/* <section className="channels">
        </section> */}
        <section className="channels">
            <h2>Channel 1</h2>
            <textarea className="channel channel1" defaultValue="teste"></textarea>

            <h2>Channel 2</h2>
            <textarea className="channel channel2" defaultValue="teste"></textarea>
        </section>
    </section>
}


function Octave({ octave }) {
  return (
    <div className="octave">
      <div className="white-container">
        {notes.map(note => (
          <button key={note + octave} className="white-key">{note + octave}</button>
        ))}
      </div>
      {notes.map((note, i) =>
        hasBlack[note] ? (
          <button
            key={note + '#' + octave}
            className="black-key"
            style={{ left: `${(i + 1) * 40 - 10}px` }}
          >
            {hasBlack[note].map(n => n + octave).join('\n')}
          </button>
        ) : null
      )}
    </div>
  )
}


function Keyboard() {
  return (
    <div className="keyboard">
      {octaves.map(octave => (
        <Octave key={octave} octave={octave} />
      ))}
    </div>
  );
};