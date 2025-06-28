import { useRef, useState } from 'react'

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
const octaves = [2, 3, 4, 5, 6]


export function UIAudioSynth({modelClass}) {
    const synthRef = useRef(null);

    const playNote = async (note) => {
        // workaround for AudioContext initialization
        // to avoid autoplay warning in browsers
        if (! synthRef.current) {
            // dynamically import Tone.js
            const ToneLib = await import('tone');
            await ToneLib.start()
            const synth = new ToneLib.Synth().toDestination()
            synthRef.current = [ToneLib, synth]
        }
        const [Tone, synth] = synthRef.current
        // const now = Tone.now()
        synth.triggerAttackRelease(note, "8n");
    };

    const ctx = {
        playNote
    }

    return <section className='UIAudioSynth'>
        <Keyboard ctx={ctx} />
        <section className="channels">
            <select id="exampleSelect1">
                <option value="">-- Select a melody --</option>
                <option value="C4 4n E4 4n G4 4n">C major arpeggio</option>
                <option value="C4 4n D4 4n E4 4n F4 4n G4 4n">Scale</option>
                <option value="E3 8n G3 8n A3 8n Bb3 8n G3 4n E3 8n G3 8n B3 8n A3 4n F3 8n G3 8n C4 8n Bb3 4n A3 8n G3 8n E3 4n">Dark forest</option>
            </select>
            <h2>Channel 1</h2>
            <textarea className="channel channel1" defaultValue="teste"></textarea>

            <h2>Channel 2</h2>
            <textarea className="channel channel2" defaultValue="teste"></textarea>
        </section>
    </section>
}


function Keyboard({ctx}) {
    return (
        <div className="keyboard">
            {octaves.map(octave => (
                <Octave key={octave} ctx={ctx} octave={octave} />
            ))}
        </div>
    );
};


function Octave({ ctx, octave }) {
    const btnClick = async (event) => {
        const note = event.target.getAttribute('data-key')
        ctx.playNote(note)
    }

    return (
        <div className="octave">
        <div className="white-container">
            {notes.map((note, i) => (
                <button
                    key={`${note} + ${i}`}
                    className="white-key"
                    data-key={note + octave}
                    onClick={btnClick}
                >
                    {note + octave}
                </button>
            ))}
        </div>
        {notes.map((note, i) => {
            if (! hasBlack[note]) return null
            const value = hasBlack[note].map(n => n + octave).join('\n')
            return <button
                    key={`${note} + ${i}`}
                    data-key={value}
                    className="black-key"
                    style={{ left: `${(i + 1) * 40}px` }}
                    onClick={btnClick}
                >
                {value}
            </button>
        })}
        </div>
    )
}
