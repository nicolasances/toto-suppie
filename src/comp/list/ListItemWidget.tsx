import React, { useState } from 'react';
import { CheckBox } from '../input/Checkbox';
import './ListItem.css';
import { ReactComponent as TickSVG } from '../../images/tick.svg';
import { TouchableOpacity } from '../util/TouchableOpacity';

export interface ListItemProps {
    description: string
    ticked: boolean
    style?: "todo" | "plain"
    temp?: boolean
    tickable?: boolean

    onPress?: () => void
}

export function ListItemWidget(props: ListItemProps) {

    const [ticked, setTicked] = useState(props.ticked)

    const onClick = () => {

        // If the item is not tickable, return
        if (props.tickable === false) return;

        // If the item is in "temp" mode, click has no effect
        if (props.temp === true) return;

        setTicked(!ticked)

        if (props.onPress) props.onPress()

    }


    return (
        <TouchableOpacity className={`list-item ${props.style} ${ticked ? 'ticked' : ''} ${props.temp ? 'temp' : ''}`} onPress={onClick}>

            {(props.style == null || props.style == 'todo') && <CheckBox label={props.description} tickable={props.tickable} onToggleFlag={() => {}} flag={ticked} strikethroughWhenTicked={true} />}

            {props.style == 'plain' &&
                <PlainItem label={props.description} ticked={ticked} />
            }
        </TouchableOpacity>
    );
};

function PlainItem(props: { label: string, ticked?: boolean }) {

    return (
        <div className="plain">
            <div className="circle">
                {props.ticked && <TickSVG />}
            </div>
            <div className="label">{props.label}</div>
        </div>
    )
}