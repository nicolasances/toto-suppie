import './Screen.css'

interface GenericHomeScreenProps {
    children: any
}

export function GenericHomeScreen(props: GenericHomeScreenProps) {

    return (
        <div className="screen">
            <div className="screen-body">
                {props.children}
            </div>
        </div>
    )

}
