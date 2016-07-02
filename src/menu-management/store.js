import Store from 'd2-ui/lib/store/Store';
import { appsMenuItems$ } from 'd2-ui/lib/app-header/headerBar.store'

export const menuItemStore$ = Store.create();
export const menuItemOrder$ = appsMenuItems$
    .flatMap((items) => {
        menuItemStore$.setState({ items });

        return menuItemStore$;
    });