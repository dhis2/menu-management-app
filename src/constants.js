// The Global Shell's Command Palette (DHIS2 2.42+) renders a grid of the
// user's first 8 apps — see https://dhis2.atlassian.net/browse/DHIS2-19124.
// That number is NOT exposed by any API today; it is a constant inside the
// Shell itself. Until the Shell reads a user preference instead of hard-coding
// it, the count control on this page is a prototype: it re-slices the preview
// locally, but there is nowhere to persist the choice.
export const DEFAULT_TOP_APPS_COUNT = 8

// Selectable values for the "how many top apps" prototype control.
export const TOP_APPS_COUNT_OPTIONS = [4, 6, 8, 10, 12, 16]
