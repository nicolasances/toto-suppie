"use client";

import { useEffect, useState } from 'react';
import { GenericHomeScreen } from './components/GenericScreen';
import Lottie from 'lottie-react';
import Image from 'next/image';
import './HomeScreen.css';
import { TouchableOpacity } from './components/util/TouchableOpacity';
import { useRouter } from 'next/navigation';
import { SupermarketAPI } from '@/api/SupermarketAPI';
import { SupermarketListItem } from '@/model/SupermarketListItem';
import { useHeader } from '@/context/HeaderContext';
import RoundButton from './components/buttons/RoundButton';

const HINT_DURATION_MS = 5000;

const COLORS = [
    { bck: "#FFCC70", color: "#22668D" },
    { bck: "#FFFADD", color: "#22668D" },
    { bck: "#8ECDDD", color: "#22668D" },
    { bck: "#22668D", color: "#FFCC70" },
    { bck: "#FFCC70", color: "#22668D" },
    { bck: "#A94438", color: "#E4DEBE" },
    { bck: "#B138D0", color: "#FFE7C1" },
];

export default function Home() {
    const [mainListItems, setMainListItems] = useState<SupermarketListItem[] | null>(null);
    const [loadingMainList, setLoadingMainList] = useState(false);
    const [animData, setAnimData] = useState<any>(null);
    const [showHints, setShowHints] = useState(true);
    const router = useRouter();
    const { setConfig } = useHeader();

    /**
     * Loads the main supermarket list
     */
    const loadMainSupermarketList = async () => {
        // Start the loading if the APIs are slow
        const loadingTimer = setTimeout(() => { setLoadingMainList(true) }, 400);

        // Load the data
        const { items } = await new SupermarketAPI().getItems();

        // Stop the timer
        clearTimeout(loadingTimer);

        // Update the state
        setMainListItems(items);

        setLoadingMainList(false);
    };


    useEffect(() => {
        loadMainSupermarketList();
        // Load lottie animation
        fetch('/lottie/anim-loading.json')
            .then(res => res.json())
            .then(setAnimData);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setShowHints(false), HINT_DURATION_MS);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        setConfig({ title: 'Toto Suppie' });
    }, [setConfig]);

    return (
        <GenericHomeScreen>
            {loadingMainList && animData && <Lottie animationData={animData} loop={true} />}

            {!loadingMainList && mainListItems &&
                <div className="flex flex-col flex-1 items-center justify-center gap-6" style={{marginTop: -64}}>
                    <div className="relative">
                        <RoundButton 
                            svgIconPath={{ src: "/images/edit.svg", alt: "Edit List" }}
                            onClick={() => { router.push('/list') }} 
                            size="car"
                            type="primary"
                        />
                        <HintBubble show={showHints} text="Edit your list" />
                    </div>
                    {mainListItems && mainListItems?.length > 0 && 
                        <div className="relative">
                            <RoundButton 
                                svgIconPath={{ src: "/images/cart.svg", alt: "Start Shopping" }}
                                onClick={() => { router.push('/shop') }} 
                                size="car"
                                type="filled"
                            />
                            <HintBubble show={showHints} text="Start shopping" position="right" />
                        </div>
                    }
                    <div className="relative">
                        <RoundButton
                            svgIconPath={{ src: "/images/agent.svg", alt: "Agent Mode" }}
                            onClick={() => { router.push('/agent') }}
                            size="car"
                            type="filledSecondary"
                        />
                        <HintBubble show={showHints} text="Talk to Toto!" />
                    </div>
                    {/* <SectionButton label="Teach me!" imageSrc="/images/monkey-body.svg" onPress={() => { router.push('/teach') }} /> */}
                </div>
            }
        </GenericHomeScreen>
    );
}

function HintBubble({ show, text, position }: { show: boolean; text: string, position?: "right" | "left" }) {
    return (
        <div
            className={`absolute top-1/2 ${position === "right" ? "left-full" : "right-full"} -translate-y-1/2 ml-3 transition-opacity duration-700 ${show ? 'opacity-100' : 'opacity-0'} pointer-events-none`}
            role="status"
            aria-live="polite"
            aria-label={text}
        >
            <div className="rounded-full px-4 py-2 text-base text-gray-600 whitespace-nowrap">
                {text}
            </div>
        </div>
    );
}

function SectionButton(props: { label: string; imageSrc: string; onPress?: () => void }) {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    return (
        <TouchableOpacity className="section-button" onPress={props.onPress}>
            <div className="image" style={{ backgroundColor: color.bck, color: color.color }}>
                <Image src={props.imageSrc} alt={props.label} width={48} height={48} />
            </div>
            {/* <div className="label">{props.label}</div> */}
        </TouchableOpacity>
    );
}
