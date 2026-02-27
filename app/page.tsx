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

interface SSEMessage {
    event: string;
    data: unknown;
    receivedAt: string;
}

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
    const [sseMessages, setSseMessages] = useState<SSEMessage[]>([]);
    const [sseActive, setSseActive] = useState(false);
    const router = useRouter();

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

    const openSseStream = async () => {
        setSseMessages([]);
        setSseActive(true);

        try {
            const { conversationId } = await new SupermarketAPI().mockPostMessage();

            const response = await new SupermarketAPI().streamConversationStatus(conversationId);
            const reader = response.body?.getReader();
            if (!reader) { setSseActive(false); return; }

            const decoder = new TextDecoder();
            let buffer = '';
            let currentEvent = 'message';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';

                for (const line of lines) {
                    if (line.startsWith('event:')) {
                        currentEvent = line.slice(6).trim();
                    } else if (line.startsWith('data:')) {
                        const raw = line.slice(5).trim();
                        let data: unknown = raw;
                        try { data = JSON.parse(raw); } catch { /* keep raw string */ }
                        setSseMessages(prev => [...prev, { event: currentEvent, data, receivedAt: new Date().toISOString() }]);
                        currentEvent = 'message';
                    }
                }
            }
        } catch (err) {
            setSseMessages(prev => [...prev, { event: 'error', data: String(err), receivedAt: new Date().toISOString() }]);
        } finally {
            setSseActive(false);
        }
    };

    useEffect(() => {
        loadMainSupermarketList();
        // Load lottie animation
        fetch('/lottie/anim-loading.json')
            .then(res => res.json())
            .then(setAnimData);
    }, []);

    return (
        <GenericHomeScreen title="Toto Suppie">
            {loadingMainList && animData && <Lottie animationData={animData} loop={true} />}

            {!loadingMainList && mainListItems &&
                <div className="home-container">
                    <SectionButton 
                        label={`${mainListItems && mainListItems.length > 0 ? 'Edit the List' : 'Start a List'}`} 
                        imageSrc="/images/list.svg"
                        onPress={() => { router.push('/list') }} 
                    />
                    {mainListItems && mainListItems?.length > 0 && 
                        <SectionButton 
                            label="Start shopping!" 
                            imageSrc="/images/cart.svg"
                            onPress={() => { router.push('/shop') }} 
                        />
                    }
                    {/* <SectionButton label="Teach me!" imageSrc="/images/monkey-body.svg" onPress={() => { router.push('/teach') }} /> */}
                </div>
            }
            {/* SSE Test Section */}
            {/* <div style={{ marginTop: 32, padding: 16, background: '#1a1a2e', borderRadius: 12, color: '#eee', fontFamily: 'monospace' }}>
                <div style={{ marginBottom: 12, fontWeight: 'bold', fontSize: 14 }}>SSE Stream Test</div>
                <button
                    onClick={openSseStream}
                    disabled={sseActive}
                    style={{ padding: '8px 16px', borderRadius: 8, background: sseActive ? '#555' : '#22668D', color: '#fff', border: 'none', cursor: sseActive ? 'default' : 'pointer', marginBottom: 12 }}
                >
                    {sseActive ? 'Streaming...' : 'Start Stream'}
                </button>
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {sseMessages.length === 0 && !sseActive && <div style={{ color: '#888', fontSize: 12 }}>No messages yet.</div>}
                    {sseMessages.map((msg, i) => (
                        <div key={i} style={{ marginBottom: 6, fontSize: 12 }}>
                            <span style={{ color: '#FFCC70' }}>[{msg.receivedAt}]</span>{' '}
                            <span style={{ color: '#8ECDDD' }}>{msg.event}</span>{' '}
                            <span>{JSON.stringify(msg.data)}</span>
                        </div>
                    ))}
                </div>
            </div> */}
        </GenericHomeScreen>
    );
}

function SectionButton(props: { label: string; imageSrc: string; onPress?: () => void }) {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    return (
        <TouchableOpacity className="section-button" onPress={props.onPress}>
            <div className="image" style={{ backgroundColor: color.bck, color: color.color }}>
                <Image src={props.imageSrc} alt={props.label} width={48} height={48} />
            </div>
            <div className="label">{props.label}</div>
        </TouchableOpacity>
    );
}
