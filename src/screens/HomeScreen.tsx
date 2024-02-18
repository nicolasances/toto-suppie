import React, { useEffect, useState } from 'react';
import './Screen.css'
import './HomeScreen.css'
import { GenericHomeScreen } from './GenericScreen';
import Lottie from 'lottie-react'

import loadingAnim from '../lottie/anim-loading.json';

import { ReactComponent as ListSVG } from '../images/list.svg'
import { ReactComponent as CartSVG } from '../images/cart.svg'
import { ReactComponent as MonkeySVG } from '../images/monkey-body.svg'
import { TouchableOpacity } from '../comp/util/TouchableOpacity';
import { useNavigate } from 'react-router';
import { SupermarketAPI } from '../api/SupermarketAPI';
import { SupermarketListItem } from '../model/SupermarketListItem';

const COLORS = [
    { bck: "#FFCC70", color: "#22668D" },
    { bck: "#FFFADD", color: "#22668D" },
    { bck: "#8ECDDD", color: "#22668D" },
    { bck: "#22668D", color: "#FFCC70" },
    { bck: "#FFCC70", color: "#22668D" },
    { bck: "#A94438", color: "#E4DEBE" },
    { bck: "#B138D0", color: "#FFE7C1" },
]

export const HomeScreen: React.FC = () => {

    const [mainListItems, setMainListItems] = useState<SupermarketListItem[] | null>(null)
    const [loadingMainList, setLoadingMainList] = useState(false)

    const navigate = useNavigate()

    /**
     * Loads the main supermarket list
     */
    const loadMainSupermarketList = async () => {

        // Start the loading if the APIs are slow
        const loadingTimer = setTimeout(() => { setLoadingMainList(true) }, 400)

        // Load the data
        const { items } = await new SupermarketAPI().getItems()

        // Stop the timer
        clearTimeout(loadingTimer);

        // Update the state
        setMainListItems(items);

        setLoadingMainList(false);

    }

    useEffect(() => { loadMainSupermarketList() }, [])

    return (
        <GenericHomeScreen title="Toto Suppie">

            {loadingMainList && <Lottie animationData={loadingAnim} loop={true} />}

            {!loadingMainList && mainListItems &&
                <div className="home-container">
                    <SectionButton label={`${mainListItems && mainListItems.length > 0 ? 'Edit the List' : 'Start a List'}`} image={<ListSVG />} onPress={() => { navigate('/list') }} />
                    {mainListItems && mainListItems?.length > 0 && <SectionButton label="Start shopping!" image={<CartSVG />} onPress={() => { navigate('/shop') }} />}
                    {/* <SectionButton label="Teach me!" image={<MonkeySVG />} onPress={() => { navigate('teach') }} /> */}
                </div>
            }

        </GenericHomeScreen>
    )
};

function SectionButton(props: { label: string, image: any, onPress?: () => void }) {

    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    return (
        <TouchableOpacity className="section-button" onPress={props.onPress}>
            <div className="image" style={{ backgroundColor: color.bck, color: color.color }}>{props.image}</div>
            <div className="label">{props.label}</div>
        </TouchableOpacity>
    )

}

