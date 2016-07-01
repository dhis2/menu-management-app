import React, { Component } from 'react';

import { appsMenuItems$ } from 'd2-ui/lib/app-header/headerBar.store'
import { getInstance } from 'd2/lib/d2';
import { Observable } from 'rx';
import Paper from 'material-ui/lib/paper';
import CircularProgress from 'material-ui/lib/circular-progress';
import Translate from '../utils/Translate';
import DraggableMenuItem from './DraggableMenuItem';
import { DropTarget, DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import toClass from 'recompose/toClass';
import Store from 'd2-ui/lib/store/Store';
import log from 'loglevel';
import withStateFrom from '../utils/withStateFrom';

const styles = {
    menuManagementPaper: {
        padding: '2rem',
        marginTop: '1rem',
        display: 'flex',
        width: '100%',
    },
};

/**
 * Saves the order of the passed menuItems to the server for the current user. This
 * changes the order of the users apps in the app menu.
 *
 * @param {Array} menuItems The new ordered list of menu items.
 * @returns {Observable} Observable that represents the result of the XHR request.
 * The Observable will emit on success or error when an error was thrown.
 */
function saveMenuItemOrder(menuItems) {
    return Observable.just(menuItems)
        .map(items => items.map(item => item.name))
        .combineLatest(Observable.fromPromise(getInstance()))
        .map(([items, d2]) => {
            const api = d2.Api.getApi();

            return api.post('menu', items);
        })
        .concatAll();
}

function Loading() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <CircularProgress indeterminite size={0.5} />
            <Translate>Loading...</Translate>
        </div>
    );
}

const HTML5DragDropContext = DragDropContext(HTML5Backend);

function moveOption(dragId, hoverId) {
    const items = menuItemStore$.getState().items;

    const dragIndex = items.findIndex(item => item.name === dragId);
    const hoverIndex = items.findIndex(item => item.name === hoverId);
    const dragItem = items[dragIndex];
    const newList = [...items];

    newList.splice(dragId, 1);
    newList.splice(hoverId, 0, dragItem);

    menuItemStore$.setState({
        items: newList,
    });
}

const MenuItemList = HTML5DragDropContext(class MenuItemList extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            items: props.items,
        };

        this.moveItem = this.moveItem.bind(this);
        this.onListUpdated = this.onListUpdated.bind(this);
    }

    moveItem(dragId, targetId) {
        const dragIndex = this.state.items.findIndex(option => option.name === dragId);
        const targetIndex = this.state.items.findIndex(option => option.name === targetId);
        const dragOption = this.state.items[dragIndex];

        const newList = [...this.state.items];

        newList.splice(dragIndex, 1);
        newList.splice(targetIndex, 0, dragOption);

        this.setState({
            items: newList,
        });
    }

    onListUpdated() {
        this.props.onListUpdated(this.state.items, this.props.items);
    }

    render() {
        return (
            <div style={{ display: 'flex', flexWrap: 'wrap', }}>
                {this.state.items.map((item, index) => (
                    <DraggableMenuItem
                        key={item.name} {...item}
                        index={index}
                        moveItem={this.moveItem}
                        onListUpdated={this.onListUpdated}
                    />
                ))}
            </div>
        );
    }
});

function saveListWhenChanged(newList, oldList) {
    const isTheSameList = newList.length === oldList.length && newList.every((item, index) => oldList[index] === item);

    // No save needed when the list is the same
    if (isTheSameList) {
        return;
    }

    // Update the store
    menuItemStore$.setState({
        items: newList,
    });

    menuItemStore$
        .take(1)
        .flatMap(({items: menuItems}) => saveMenuItemOrder(menuItems))
        .subscribe(
            () => console.log('success'),
            (e) => console.log('failed', e),
            () => console.log('complete!')
        );
}

function MenuItemSorter(props) {
    return (
        <MenuItemList items={props.items} onListUpdated={saveListWhenChanged} />
    );
}

const menuItemStore$ = Store.create();
const menuItemOrder$ = appsMenuItems$
    .flatMap((items) => {
        menuItemStore$.setState({ items });

        return menuItemStore$;
    });

const MenuItems = withStateFrom(menuItemOrder$, MenuItemSorter, Loading);

export default class MenuManagement extends Component {
    render() {
        return (
            <Paper style={styles.menuManagementPaper}>
                <MenuItems />
            </Paper>
        );
    }
}
