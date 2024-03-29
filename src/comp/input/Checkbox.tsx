import './Checkbox.css';
import { ReactComponent as TickSVG } from '../../images/tick.svg'

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
                    <TickSVG />
                }
            </div>
            <div className={`text ${props.strikethroughWhenTicked === true ? "strikethroughWhenTicked" : ''}`}>
                {props.label ? props.label : ""}
            </div>
        </div>
    )
}