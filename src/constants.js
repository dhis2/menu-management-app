// The Global Shell's Command Palette (DHIS2 2.42+) renders a grid of the
// user's top apps — see https://dhis2.atlassian.net/browse/DHIS2-19124. This
// is only the *initial* boundary on first load; from then on it's genuinely
// dynamic — see TOP_MENU_DIVIDER_ID below.
export const DEFAULT_TOP_APPS_COUNT = 8

// A sentinel id spliced into useMenuOrder's `order` array, marking the
// boundary between "Top apps" and "Other apps". It is a real member of the
// sortable array (not external state) so that dragging a real app across it
// naturally grows or shrinks the top group as a side effect of the array
// splice — see useMenuOrder.js and AppList.jsx.
export const TOP_MENU_DIVIDER_ID = '__top-menu-divider__'
