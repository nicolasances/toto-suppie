"use client";

import Image from 'next/image';

import './TitleBar.css';
import { useRouter } from 'next/navigation';

interface TitleBarProps {

    title: string

    back?: boolean
    leftButton?: any, 
    rightButton?: any

    onBack?: () => void
}

export function TitleBar(props: TitleBarProps) {

    const router = useRouter()

    const navigateBack = () => {

        if (props.onBack) props.onBack();

        router.back();
    }

    // Left button
    let leftButton = (
        <div className="button-container"></div>
    )
    if (props.back) leftButton = (
        <div className="button-container">
            <Image src="/images/left-arrow.svg" alt="Back" width={24} height={24} className="icon" onClick={navigateBack} />
        </div>
    )
    else if (props.leftButton) leftButton = props.leftButton

    // Right button
    // When a rightButton is provided, wrap it with a menu-spacer so it sits to the
    // left of the SideMenu's fixed button (positioned at right-4 in the viewport).
    let rightButton = props.rightButton ? (
        <div className="right-area">
            <div className="button-container flex">
                {props.rightButton}
            </div>
            <div className="menu-spacer" />
        </div>
    ) : (
        <div className="button-container" />
    )

    return (
        <div className="title-bar">
            {leftButton}
            <div className="title">{props.title}</div>
            {rightButton}
        </div>
    )
}
