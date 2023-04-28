import React, { createContext, useContext, useReducer } from 'react';
import { SET_FLAG_EMBED, SET_FLAG_NAVIGATE } from './type';

// Define the initial state
const initialState = {
  isEmbed: false,
  isNavigate: false,
};

// Define the reducer function
function reducer(state, action) {
  switch (action.type) {
    case SET_FLAG_EMBED:
      return { ...state, isEmbed: action.payload.isEmbed };
    case SET_FLAG_NAVIGATE:
      return { ...state, isNavigate: action.payload.isNavigate };
    default:
      throw new Error();
  }
}

export const EmbedContext = createContext();

// Define the component that provides the context
export function EmbedProvider(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return <EmbedContext.Provider value={value} {...props} />;
}
