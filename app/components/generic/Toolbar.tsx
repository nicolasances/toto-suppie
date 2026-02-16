
interface ToolbarProps {
    children: any
}

export function Toolbar(props: ToolbarProps) {

    return (
        <div className="suptoolbar">

            <div className="visibletbar">
                {props.children}
            </div>

        </div>
    )

}

export function ToolbarButton() {
    
    return (
        <div className="suptbutton">
            
        </div>
    )
}