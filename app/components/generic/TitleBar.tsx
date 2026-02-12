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
