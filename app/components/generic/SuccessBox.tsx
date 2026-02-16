"use client";

import React from 'react';
import './SuccessBox.css'
import Lottie from 'lottie-react'

export function SuccessBox() {

    const [animData, setAnimData] = React.useState(null);

    React.useEffect(() => {
        fetch('/lottie/anim-success.json')
            .then(res => res.json())
            .then(setAnimData);
    }, []);

    if (!animData) return null;

    return (
        <div className="success-box">
            <div className="title">Congratulations!</div>
            <Lottie animationData={animData} loop={false} />
            <div className='text'>You're done!<br></br>You can run home now!</div>
        </div>
    )
}