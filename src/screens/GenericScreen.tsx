import { TitleBar } from "../comp/generic/TitleBar"
import './Screen.css'

interface GenericHomeScreenProps {
    title: string,
    children: any,
    back?: boolean
}

export function GenericHomeScreen(props: GenericHomeScreenProps) {

    return (
        <div className="screen">
            <TitleBar title={props.title} back={props.back} />
            <div className="screen-body">
                {props.children}
            </div>
        </div>
    )

}