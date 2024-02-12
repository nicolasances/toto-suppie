import React, { RefObject, useEffect, useRef, useState } from 'react';
import './ListScreen.css'
import { SupermarketListItem } from '../model/SupermarketListItem';
import { SupermarketList } from '../comp/list/SupermarketList';
import { GenericHomeScreen } from './GenericScreen';

import { ReactComponent as PlusSVG } from '../images/plus.svg';
import { ReactComponent as TrashSVG } from '../images/trash.svg';
import { SupermarketAPI } from '../api/SupermarketAPI';

export const ListScreen: React.FC = () => {

    const [supermarketList, setSupermarketList] = useState<SupermarketListItem[]>([]);
    const [addMode, setAddMode] = useState(false)

    const newItemRef = useRef<HTMLInputElement>(null)
    const listContainerRef = useRef<HTMLDivElement>(null)

    /**
     * Loads the items of the list
     */
    const loadSupermarketList = async () => {

        const { items } = await new SupermarketAPI().getItems()

        setSupermarketList(items)

    };

    /**
     * Adds an item to the supermarket list
     * 
     * @param item the description of the item
     */
    const addItem = async (item: string) => {

        const listItem: SupermarketListItem = { name: item, ticked: false, temp: true }

        // Add the item to the top of the list - setting it to temp
        setSupermarketList([listItem, ...supermarketList])

        // Post the new item
        await new SupermarketAPI().addItem(listItem);

        // Reload the supermarket list
        loadSupermarketList()

    }

    /**
     * When the user pressed on the "New Item" button
     */
    const onNewItem = () => {

        setAddMode(true)

    }

    /**
     * When the user saves the new item
     */
    const onSaveNewItem = (itemText: string | null) => {

        // Add the item to the supermarket list
        if (itemText) addItem(itemText);

        // Move back to the list
        setAddMode(false)

    }

    /**
     * When the user clicks on an item
     */
    const onItemClick = async (item: SupermarketListItem) => {

        // Toggle the item's flag
        item.ticked = !item.ticked

        // Save the item
        await new SupermarketAPI().updateItem(item);

        // Reload the list 
        loadSupermarketList()

    }

    useEffect(() => { loadSupermarketList() }, [])
    useEffect(() => { if (newItemRef.current) newItemRef.current.focus() }, [addMode])

    return (
        <GenericHomeScreen title="List" back={true}>

            <div className="slist" ref={listContainerRef}>
                {!addMode &&
                    <SupermarketList
                        items={supermarketList}
                        onItemClick={onItemClick}
                        tickable={false}
                    />
                }
                {addMode && <NewItem inputRef={newItemRef} onSave={onSaveNewItem} onCancel={() => { setAddMode(false) }} />}
            </div>

            {!addMode && <BottomBar onPress={onNewItem} />}

        </GenericHomeScreen>
    )
};

function NewItem(props: { inputRef: RefObject<HTMLInputElement>, onSave: (value: string | null) => void, onCancel?: () => void }) {

    const [value, setValue] = useState(null)

    /**
     * Reacts to key down events, mostly to trigger the save
     * 
     * @param e event
     */
    const onKeyDown = (e: any) => {

        if (e.key === 'Enter' || e.key === 'Done') {
            props.onSave(value);
        }

    }

    /**
     * Reacts to the click on the delete button
     */
    const onDeleteClick = () => {

        if (props.onCancel) props.onCancel();

    }

    return (
        <div className="new-item">
            <div className="input">
                <div className="circle"></div>
                <input
                    type="text"
                    ref={props.inputRef}
                    onChange={(e: any) => { setValue(e.target.value) }}
                    onKeyDown={onKeyDown}
                />
                <div className="cancel-button" onClick={onDeleteClick}>
                    <TrashSVG />
                </div>
            </div>
        </div>
    )
}


function BottomBar(props: { onPress: () => void }) {

    return (
        <div className="bottombar" onClick={props.onPress}>
            <div className="bar">
                <div className="icon-container">
                    <PlusSVG />
                </div>
                <div className="label">
                    Add an item
                </div>
            </div>
        </div>
    )
}