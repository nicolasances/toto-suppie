"use client";

import { MaskedSvgIcon } from '../MaskedSvgIcon';
import './Checkbox.css';
import Image from 'next/image';

export interface CheckBoxProps {

    onToggleFlag: () => void,
    flag: boolean
    label?: string, 
    strikethroughWhenTicked?: boolean
    tickable?: boolean

}

export function CheckBox(props: CheckBoxProps) {

    const toggleFlag = () => {

        // Toggle only if tickable
        if (props.tickable === false) return;

        // Toggle the flag
        if (props.onToggleFlag) props.onToggleFlag();
    }

    return (
        <div className={`checkbox ${props.flag === true ? 'ticked' : ''}`} onClick={toggleFlag}>
            <div className={`box ${props.flag ? "flagged" : "unflagged"}`} >
                {props.flag &&
                    <MaskedSvgIcon size='w-4 h-4' src='images/tick.svg' alt="Tick" color='bg-cyan-700' />
                }
            </div>
            <div className={`text ${props.strikethroughWhenTicked === true ? "strikethroughWhenTicked" : ''}`}>
                {props.label ? props.label : ""}
            </div>
        </div>
    )
}