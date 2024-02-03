import React, { useEffect, useState } from 'react';
import './Screen.css'
import './HomeScreen.css'
import { GenericHomeScreen } from './GenericScreen';

import { ReactComponent as ListSVG } from '../images/list.svg'
import { ReactComponent as CartSVG } from '../images/cart.svg'
import { ReactComponent as MonkeySVG } from '../images/monkey-body.svg'
import { TouchableOpacity } from '../comp/util/TouchableOpacity';
import { useNavigate } from 'react-router';

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

    const navigate = useNavigate()

    return (
        <GenericHomeScreen title="Toto Suppie">

            <div className="home-container">
                <SectionButton label="Edit the list" image={<ListSVG />} onPress={() => { navigate('/list') }} />
                <SectionButton label="Start shopping!" image={<CartSVG />} onPress={() => { navigate('/shop') }} />
                <SectionButton label="Teach me!" image={<MonkeySVG />} onPress={() => { navigate('teach') }} />
            </div>

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

