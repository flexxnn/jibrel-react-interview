
export const selectAppState = (state) => state.appState;

export const selectItemsArray = (state) => state.requests.items;
export const selectRestErrorCount = (state) => state.requests.restErrorRequestsCount;
export const selectRestRequestsCount = (state) => state.requests.restSuccessRequestsCount;
