import { TouchableOpacity } from '../util/TouchableOpacity'
import './TotoButton.css'

export interface TotoButtonProps {
    label: string
    onPress?: () => void
    size?: "s" | "m"
    type?: "primary" | "secondary"
}

export function TotoButton(props: TotoButtonProps) {

    return (
        <TouchableOpacity className={`toto-button ${props.size} ${props.type}`} onPress={props.onPress}>
            <div className="label">{props.label}</div>
        </TouchableOpacity>
    )
}