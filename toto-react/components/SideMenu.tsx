'use client';

import { useState } from 'react';
import { useCarMode } from '@/toto-react/context/CarModeContext';
import RoundButton from '@/toto-react/components/buttons/RoundButton';
import { MaskedSvgIcon } from '@/toto-react/components/MaskedSvgIcon';

export interface SideMenuItem {
    id?: string;
    label: string;
    iconPath?: string;
    iconAlt?: string;
    onClick: () => void;
    closeOnClick?: boolean;
}

interface SideMenuProps {
    items?: SideMenuItem[];
}

export default function SideMenu({ items = [] }: SideMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { carMode, toggleCarMode } = useCarMode();

    const handleItemClick = (item: SideMenuItem) => {
        item.onClick();

        if (item.closeOnClick !== false) {
            setIsOpen(false);
        }
    };

    return (
        <>
            {/* Menu Icon - Fixed in top right */}
            <div className="fixed top-5 right-4 z-40">
                <RoundButton
                    svgIconPath={{
                        src: "/images/menu.svg",
                        alt: "Menu",
                    }}
                    slim
                    onClick={() => setIsOpen(!isOpen)}
                />
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Slide-out Menu */}
            <div
                className={`fixed top-0 right-0 h-full w-64 shadow-lg z-40 transform transition-transform duration-300 ease-in-out flex flex-col p-2 ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
                style={{ backgroundColor: 'var(--background)' }}
            >
                <div className="flex justify-between items-center mb-8">
                </div>

                    {items.map((item, index) => (
                        <div
                            key={item.id ?? `${item.label}-${index}`}
                            onClick={() => handleItemClick(item)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    handleItemClick(item);
                                }
                            }}
                            role="button"
                            tabIndex={0}
                            className="p-3 rounded font-medium text-left hover:bg-cyan-600 text-base transition-colors flex items-center gap-2 cursor-pointer"
                        >
                            {item.iconPath && (
                                <MaskedSvgIcon
                                    src={item.iconPath}
                                    alt={item.iconAlt ?? item.label}
                                    size="w-5 h-5"
                                    color="bg-cyan-800"
                                />
                            )}
                            <span>{item.label}</span>
                        </div>
                    ))}
                    <div className='flex-1'></div>
                    
                    <div className="flex items-center justify-between p-3 rounded">
                        <span className="text-base font-medium">Car Mode</span>
                        <button
                            onClick={() => {
                                toggleCarMode();
                            }}
                            className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                                carMode
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-300 text-gray-700'
                            }`}
                        >
                            {carMode ? 'ON' : 'OFF'}
                        </button>
                    </div>

            </div>
        </>
    );
}
