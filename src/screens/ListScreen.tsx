import React, { ReactComponentElement, RefObject, useEffect, useRef, useState } from 'react';
import './ListScreen.css'
import { SupermarketListItem } from '../model/SupermarketListItem';
import { SupermarketList } from '../comp/list/SupermarketList';
import { GenericHomeScreen } from './GenericScreen';

import { ReactComponent as PlusSVG } from '../images/plus.svg';
import { ReactComponent as TrashSVG } from '../images/trash.svg';
import { SupermarketAPI } from '../api/SupermarketAPI';
import { ListItemWidget } from '../comp/list/ListItemWidget';

export const ListScreen: React.FC = () => {

    const [supermarketList, setSupermarketList] = useState<SupermarketListItem[]>([]);
    const [names, setNames] = useState<string[]>([]);
    const [addMode, setAddMode] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [editedItem, setEditedItem] = useState<SupermarketListItem | null>(null)

    const newItemRef = useRef<HTMLInputElement>(null)
    const listContainerRef = useRef<HTMLDivElement>(null)

    /**
     * Load the most commons names, to support autocomplete
     */
    const loadNames = async () => {

        const { names } = await new SupermarketAPI().getNames();

        setNames(names);
    }

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
     * Updates the item
     * 
    */
    const onUpdateItem = (itemText: string | null) => {

        // Update the item
        if (itemText && editedItem) editedItem.name = itemText;

        // Add the item to the supermarket list
        if (itemText) new SupermarketAPI().updateItem(editedItem!)

        // Move back to the list
        setEditMode(false)

    }

    /**
     * When the user clicks on an item
     */
    const onItemClick = async (item: SupermarketListItem) => {

        // Set the "edited" item 
        setEditedItem(item);

        setEditMode(true);

    }

    /**
     * Deletes the item from the main list
     */
    const onItemDelete = async () => {

        if (!editedItem || !editedItem.id) return;

        // Delete the item 
        await new SupermarketAPI().deleteItem(editedItem.id)

        // Reload the list 
        loadSupermarketList()

        // Close edit mode
        setEditMode(false)

    }

    useEffect(() => { loadSupermarketList() }, [])
    useEffect(() => { loadNames() }, [])
    useEffect(() => { if (newItemRef.current) newItemRef.current.focus() }, [addMode, editMode])

    return (
        <GenericHomeScreen title="List" back={!addMode && !editMode}>

            <div className="slist" ref={listContainerRef}>
                {!addMode && !editMode &&
                    <SupermarketList
                        items={supermarketList}
                        onItemClick={onItemClick}
                        tickable={false}
                    />
                }
                {addMode && <NewItem inputRef={newItemRef} onSave={onSaveNewItem} onCancel={() => { setAddMode(false) }} names={names} />}
                {editMode && <NewItem item={editedItem} inputRef={newItemRef} onSave={onUpdateItem} onCancel={onItemDelete} names={names} />}
            </div>

            {!addMode && !editMode && <BottomBar onPress={onNewItem} />}

        </GenericHomeScreen>
    )
};

function NewItem(props: { inputRef: RefObject<HTMLInputElement>, item?: SupermarketListItem | null, names: string[], onSave: (value: string | null,) => void, onCancel?: () => void }) {

    const [value, setValue] = useState<string | null>(null)
    const [candidates, setCandidates] = useState<string[]>([])

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

    /**
     * When the user changes the text. 
     * Updates the value and shows the autocomplete.
     */
    const onChange = (e: any) => {

        // Update the value
        setValue(e.target.value);

        // Show the autocomplete options
        // 1. Find the names
        const prefix = e.target.value.toLowerCase();

        const cand = props.names.filter(name => prefix != '' && name.toLowerCase().startsWith(prefix))

        setCandidates(cand)

    }

    /**
     * Creates the item with that candidate name
     * 
     * @param candidate the candidate name selected
     */
    const selectCandidate = (candidate: string) => {

        props.onSave(candidate);

    }

    useEffect(() => {
        if (props.item) setValue(props.item.name)
    }, [])

    return (
        <div className="new-item">
            <div className="input">
                <div className="circle"></div>
                <input
                    type="text"
                    value={value ?? ""}
                    ref={props.inputRef}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                />
                <div className="cancel-button" onClick={onDeleteClick}>
                    <TrashSVG />
                </div>
            </div>
            <div className='autocomplete-container'>
                {
                    candidates.map((candidate) => {
                        return (
                            <ListItemWidget description={candidate} ticked={false} key={Math.random()} onPress={() => { selectCandidate(candidate) }} tickable={false} />
                        )
                    })
                }
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