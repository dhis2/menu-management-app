import { Observable } from 'rx';
import { getInstance } from 'd2/lib/d2';
import { menuItemStore$ } from './store';
import { setSnackMessage } from '../snack-bar/actions';
import log from 'loglevel';

/**
 * Saves the order of the passed menuItems to the server for the current user. This
 * changes the order of the users apps in the app menu.
 *
 * @param {Array} menuItems The new ordered list of menu items.
 * @returns {Observable} Observable that represents the result of the XHR request.
 * The Observable will emit on success or error when an error was thrown.
 */
export function saveMenuItemOrder(menuItems) {
    return Observable.just(menuItems)
        .map(items => items.map(item => item.name))
        .combineLatest(Observable.fromPromise(getInstance()))
        .map(([items, d2]) => {
            const api = d2.Api.getApi();

            return api.post('menu', items);
        })
        .concatAll();
}

export function saveListWhenChanged(newList, oldList) {
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
        .flatMap(({ items: menuItems }) => saveMenuItemOrder(menuItems))
        .subscribe(
            () => getInstance().then((d2) => setSnackMessage(d2.i18n.getTranslation('Menu_items_saved'))),
            (e) => {
                log.error(e);
                getInstance().then((d2) => setSnackMessage(d2.i18n.getTranslation('Failed_to_save'), 'dismiss'));
            }
        );
}
