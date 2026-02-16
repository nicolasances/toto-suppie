"use client";

import './MonkeyLevel.css'

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { SpeechBubble } from '../generic/SpeechBubble';

const skillLevels = {
    dumb: {
        name: "Dumb as a rock",
        image: (<Image src="/images/skill/dumb.svg" alt="Dumb" width={100} height={100} />),
        description: "I'm really stupid, sorry... You need to start teaching me the basics!"
    }
}

export function MonkeyLevel() {

    const [intro, setIntro] = useState(true)

    /**
     * Times out the intro
     */
    const timeIntro = () => {
        setTimeout(() => { setIntro(false) }, 2000)
    }

    useEffect(timeIntro, [])

    return (
        <div className="monkey-level">
            {intro && <MonkeyIntro />}
            {!intro && <TotoSkillLevel skillLevel='dumb' />}
        </div>
    )
}

/**
 * Shows the level of skill of Toto
 */
function TotoSkillLevel(props: { skillLevel: "dumb" }) {

    const skill = skillLevels[props.skillLevel];

    return (
        <div className='toto-skill'>
            <div className='image'>
                {skill.image}
            </div>
            <div className='text'>
                <div className="skill-name">{skill.name}</div>
                <div className="skill-desc">{skill.description}</div>
            </div>
        </div>
    )
}

/**
 * Shows an intro where Toto asks for help from the user to get 
 * better at guessing items' order
 */
function MonkeyIntro() {

    return (
        <div className="monkey-intro">
            <div className="image">
                <Image src="/images/monkey-body.svg" alt="Monkey" width={150} height={150} />
            </div>
            <SpeechBubble text="Help me learn the order in which items should be picked up!" />
        </div>
    )
}