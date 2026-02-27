'use client';

import { useState } from 'react';
import RoundButton from '@/toto-react/components/buttons/RoundButton';
import { MaskedSvgIcon } from '@/toto-react/components/MaskedSvgIcon';
import ToggleableMenuItem, { ToggleableMenuItemProps } from '@/toto-react/components/ToggleableMenuItem';

export interface SideMenuItem {
    id?: string;
    label: string;
    iconPath?: string;
    iconAlt?: string;
    onClick: () => void;
    closeOnClick?: boolean;
}

export interface SideMenuToggleableItem extends ToggleableMenuItemProps {
    id?: string;
    closeOnClick?: boolean;
}

interface SideMenuProps {
    items?: SideMenuItem[];
    toggleableItems?: SideMenuToggleableItem[];
}

export default function SideMenu({ items = [], toggleableItems = [] }: SideMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleItemClick = (item: SideMenuItem) => {
        item.onClick();

        if (item.closeOnClick !== false) {
            setIsOpen(false);
        }
    };

    const handleToggleableItemClick = (item: SideMenuToggleableItem) => {
        item.onClick();

        if (item.closeOnClick) {
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
                    type='secondary'
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

                    {toggleableItems.map((item, index) => (
                        <ToggleableMenuItem
                            key={item.id ?? `${item.label}-${index}`}
                            label={item.label}
                            iconPath={item.iconPath}
                            iconAlt={item.iconAlt}
                            isActive={item.isActive}
                            activeText={item.activeText}
                            inactiveText={item.inactiveText}
                            onClick={() => handleToggleableItemClick(item)}
                        />
                    ))}

            </div>
        </>
    );
}
