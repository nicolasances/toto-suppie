import React, { useState } from 'react';
import './TotoPopup.css'; // Import your CSS file for styling

interface TotoPopupProps {
    isOpen: boolean;
    onClose?: () => void;
    children: any
}

const TotoPopup: React.FC<TotoPopupProps> = ({ children, isOpen, onClose }) => {

    // Function to handle clicks outside the popup
    const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if ((e.target as HTMLDivElement).classList.contains('popup-background')) {
            onClose && onClose();
        }
    };

    return (
        <>
            {/* Darkened background */}
            {isOpen && <div className="popup-background" onClick={handleOutsideClick}></div>}

            {/* Popup */}
            {isOpen && (
                <div className="popup">
                    {children}
                </div>
            )}
        </>
    );
}

export default TotoPopup;
