import { TitleBar } from "../comp/generic/TitleBar"
import './Screen.css'

interface GenericHomeScreenProps {
    title: string
    children: any
    back?: boolean
    rightButton?: any
}

export function GenericHomeScreen(props: GenericHomeScreenProps) {

    return (
        <div className="screen">
            <TitleBar title={props.title} back={props.back} rightButton={props.rightButton} />
            <div className="screen-body">
                {props.children}
            </div>
        </div>
    )

}