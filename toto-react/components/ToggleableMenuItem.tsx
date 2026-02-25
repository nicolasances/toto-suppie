'use client';

import { MaskedSvgIcon } from '@/toto-react/components/MaskedSvgIcon';

export interface ToggleableMenuItemProps {
    label: string;
    iconPath?: string;
    iconAlt?: string;
    isActive: boolean;
    onClick: () => void;
    activeText?: string;
    inactiveText?: string;
}

export default function ToggleableMenuItem({
    label,
    iconPath,
    iconAlt,
    isActive,
    onClick,
    activeText = 'ON',
    inactiveText = 'OFF',
}: ToggleableMenuItemProps) {
    return (
        <div
            onClick={onClick}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onClick();
                }
            }}
            role="button"
            tabIndex={0}
            className="p-3 rounded font-medium text-left hover:bg-cyan-600 text-base transition-colors flex items-center justify-between gap-2 cursor-pointer"
        >
            <div className="flex items-center gap-2">
                {iconPath && (
                    <MaskedSvgIcon
                        src={iconPath}
                        alt={iconAlt ?? label}
                        size="w-5 h-5"
                        color="bg-cyan-800"
                    />
                )}
                <span>{label}</span>
            </div>

            <div
                className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                    isActive
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-300 text-gray-700'
                }`}
            >
                {isActive ? activeText : inactiveText}
            </div>
        </div>
    );
}
