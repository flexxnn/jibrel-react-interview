
export const selectAppState = (state) => state.appState;

export const selectItemsArray = (state) => state.requests;
export const selectItem = (state, id) => state.requests.find(item => item.id === id);

export const selectModal = (state) => state.modal;

// export const selectRestErrorCount = (state) => state.requests.restErrorRequestsCount;
// export const selectRestRequestsCount = (state) => state.requests.restSuccessRequestsCount;
