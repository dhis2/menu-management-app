import Store from 'd2-ui/lib/store/Store';
import { closeSnackBar } from './actions';

export const snackBarStore$ = Store.create();
export const snackBarMessage$ = snackBarStore$
    .map(({ message = '', action = 'ok', open = false, onActionTouchTap = closeSnackBar }) => {
        return {
            message,
            action,
            open: open,
            onRequestClose: closeSnackBar,
            onActionTouchTap: onActionTouchTap,
        };
    });