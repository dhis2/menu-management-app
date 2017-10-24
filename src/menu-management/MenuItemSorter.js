import React from 'react';
import PropTypes from 'prop-types';
import MenuItemList from './MenuItemList';
import { saveListWhenChanged } from './actions';

export default function MenuItemSorter(props) {
    return (
        <MenuItemList
            items={props.items}
            onListUpdated={saveListWhenChanged}
        />
    );
}

MenuItemSorter.propTypes = {
    items: PropTypes.array.isRequired,
};
