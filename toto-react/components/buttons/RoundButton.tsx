import React, { useState } from "react";
import { MaskedSvgIcon } from "../MaskedSvgIcon";

type RoundButtonType = "primary" | "filled" | "secondary" | "filledSecondary" | "menu";

export default function RoundButton({
    icon,
    svgIconPath,
    onClick,
    size,
    disabled,
    loading,
    type = "primary",
}: {
    icon?: React.ReactNode;
    svgIconPath?: {
        src: string;
        alt: string;
        color?: string;
        backgroundSrc?: string;
        backgroundOpacity?: number;
    };
    onClick: () => void;
    size?: "xs" | "s" | "m" | "car" | undefined;
    disabled?: boolean;
    iconOnly?: boolean;
    loading?: boolean;
    type?: RoundButtonType;
}) {
    const [pressed, setPressed] = useState(false);

    let iconSize = "w-6 h-6";
    let buttonPadding = "p-2";

    if (size === "s") {
        iconSize = "w-4 h-4";
        buttonPadding = "p-2";
    }
    else if (size == "xs") {
        iconSize = "w-3 h-3";
        buttonPadding = "p-1";
    }
    else if (size === "car") {
        iconSize = "w-12 h-12";
        buttonPadding = "p-6";
    }

    const visualType: RoundButtonType = loading ? "primary" : type;

    const reactToClick = () => {
        if (disabled || loading) return;
        if (onClick) onClick();
    };

    const hasBorder = !loading &&
        (visualType === "primary" || visualType === "filled" || visualType === "filledSecondary");
    const baseClasses = `flex items-center justify-center rounded-full ${buttonPadding} ${hasBorder ? "border-2" : ""} cursor-pointer transition-transform duration-100`;

    const enabledClasses =
        visualType === "filled"
            ? "border-lime-200 bg-lime-200"
            : visualType === "primary"
                ? "border-lime-200"
            : visualType === "filledSecondary"
                ? "border-cyan-600 bg-cyan-600"
            : visualType === "secondary"
                ? "hover:opacity-70"
                : "border-cyan-600 hover:opacity-70";

    const disabledClasses =
        visualType === "secondary"
            ? "opacity-50 cursor-not-allowed"
            : "border-cyan-600 cursor-not-allowed opacity-50";

    const iconClasses = `${iconSize} stroke-current fill-current`;
    const iconColor = disabled || loading
        ? "text-cyan-600"
        : visualType === "primary"
            ? "text-lime-200"
            : "text-cyan-800";

    const svgIconColor = disabled || loading
        ? "bg-cyan-600"
        : visualType === "primary"
            ? "bg-lime-200"
            : "bg-cyan-800";

    const animatedCircleRadius = 15;

    return (
        <div
            className={`${baseClasses} ${disabled || loading ? disabledClasses : enabledClasses}`}
            style={{
                transform: pressed ? "scale(0.95)" : "scale(1)",
            }}
            onClick={reactToClick}
            onMouseDown={() => !disabled && setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            onTouchStart={() => !disabled && setPressed(true)}
            onTouchEnd={() => setPressed(false)}
            tabIndex={0}
            role="button"
            aria-disabled={disabled}
        >
            {svgIconPath ? (
                <MaskedSvgIcon
                    src={svgIconPath.src}
                    alt={svgIconPath.alt}
                    size={iconSize}
                    color={svgIconPath.color || svgIconColor}
                    backgroundSrc={svgIconPath.backgroundSrc}
                    backgroundOpacity={svgIconPath.backgroundOpacity}
                />
            ) : (
                <div className={`${iconClasses} ${iconColor}`}>{icon}</div>
            )}

            {/* Looading animation */}
            {loading && (
                <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 32 32"
                    fill="none"
                    style={{ zIndex: 1 }}
                >
                    <circle
                        cx="16"
                        cy="16"
                        r={animatedCircleRadius}
                        stroke="#0891b2"
                        strokeWidth="1"
                        strokeDasharray={Math.PI * 2 * animatedCircleRadius}
                        strokeDashoffset={0}
                        strokeLinecap="round"
                        style={{
                            transition: "stroke-dashoffset 2s linear",
                            animation: "fillCircle 2s linear infinite"
                        }}
                    />
                    <style>
                        {`
                @keyframes fillCircle {
                    0% { stroke-dashoffset: ${Math.PI * 2 * animatedCircleRadius}; }
                    50% { stroke-dashoffset: 0; }
                    100% { stroke-dashoffset: -${Math.PI * 2 * animatedCircleRadius}; }
                }
                `}
                    </style>
                </svg>
            )}
        </div>
    );
}
