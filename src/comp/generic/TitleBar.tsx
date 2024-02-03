import { ReactComponent as BackSVG } from '../../images/left-arrow.svg';

import './TitleBar.css';
import { useNavigate } from 'react-router';

interface TitleBarProps {

    title: string

    back?: boolean
    leftButton?: any, 
    rightButton?: any

    onBack?: () => void
}

export function TitleBar(props: TitleBarProps) {

    const navigate = useNavigate()

    const navigateBack = () => {

        if (props.onBack) props.onBack();

        navigate(-1);
    }

    // Left button
    let leftButton = (
        <div className="button-container"></div>
    )
    if (props.back) leftButton = (
        <div className="button-container">
            <BackSVG className="icon" onClick={navigateBack} />
        </div>
    )
    else if (props.leftButton) leftButton = props.leftButton

    // Right button
    let rightButton = (
        <div className="button-container">
            {props.rightButton}
        </div>
    )

    return (
        <div className="title-bar">
            {leftButton}
            <div className="title">{props.title}</div>
            {rightButton}
        </div>
    )
}
