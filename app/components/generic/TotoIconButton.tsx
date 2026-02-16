import { TouchableOpacity } from '../util/TouchableOpacity'
import './TotoIconButton.css'

export interface TotoIconButtonProps {
    label?: string
    image: any
    onPress?: () => void
}

export function TotoIconButton(props: TotoIconButtonProps) {

    return (
        <TouchableOpacity className="toto-icon-button" onPress={props.onPress}>
            {props.image}
        </TouchableOpacity>
    )
}