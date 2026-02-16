"use client";

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
            <div className={["box", props.flag ? "flagged" : "unflagged"].join(" ")} >
                {props.flag &&
                    <Image src="/images/tick.svg" alt="Tick" width={24} height={24} />
                }
            </div>
            <div className={`text ${props.strikethroughWhenTicked === true ? "strikethroughWhenTicked" : ''}`}>
                {props.label ? props.label : ""}
            </div>
        </div>
    )
}