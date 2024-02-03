import './MonkeyLevel.css'

import { ReactComponent as MonkeyIntroSVG } from '../../images/monkey-body.svg';
import { ReactComponent as DumbSVG } from '../../images/skill/dumb.svg';
import { useEffect, useState } from 'react';
import { SpeechBubble } from '../generic/SpeechBubble';

const skillLevels = {
    dumb: {
        name: "Dumb as a rock",
        image: (<DumbSVG />),
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
                <MonkeyIntroSVG />
            </div>
            <SpeechBubble text="Help me learn the order in which items should be picked up!" />
        </div>
    )
}