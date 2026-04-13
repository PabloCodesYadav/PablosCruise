import { createContext, useContext, useReducer } from 'react';

const initialState = {
  // Search / booking widget
  search: {
    destination: '',
    departurePort: '',
    departureDate: '',
    returnDate: '',
    guests: { adults: 2, children: 0 },
  },
  // Selected cruise to book
  selectedCruise: null,
  // Selected cabin type
  selectedCabin: null,
  // Guest details form
  guestDetails: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
    specialRequests: '',
  },
  // Booking state
  booking: null,
  // Wishlist / saved cruises
  wishlist: [],
  // Recently viewed
  recentlyViewed: [],
  // UI
  isEscobarVIP: false,
  // Wallet
  wallet: { balance: 0, cards: [] },
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SEARCH':
      return { ...state, search: { ...state.search, ...action.payload } };
    case 'SET_SELECTED_CRUISE':
      return {
        ...state,
        selectedCruise: action.payload,
        recentlyViewed: [
          action.payload,
          ...state.recentlyViewed.filter(c => c.id !== action.payload.id).slice(0, 4),
        ],
      };
    case 'SET_SELECTED_CABIN':
      return { ...state, selectedCabin: action.payload };
    case 'SET_GUEST_DETAILS':
      return { ...state, guestDetails: { ...state.guestDetails, ...action.payload } };
    case 'CONFIRM_BOOKING':
      return {
        ...state,
        booking: {
          id: `PC-${Date.now()}`,
          cruise: state.selectedCruise,
          cabin: state.selectedCabin,
          guests: state.guestDetails,
          search: state.search,
          confirmedAt: new Date().toISOString(),
          totalPrice: action.payload.totalPrice,
        },
      };
    case 'TOGGLE_WISHLIST': {
      const exists = state.wishlist.find(c => c.id === action.payload.id);
      return {
        ...state,
        wishlist: exists
          ? state.wishlist.filter(c => c.id !== action.payload.id)
          : [...state.wishlist, action.payload],
      };
    }
    case 'SET_VIP_MODE':
      return { ...state, isEscobarVIP: action.payload };
    case 'ADD_GIFT_CARD_TO_WALLET': {
      if (state.wallet.cards.some(c => c.code === action.payload.code)) return state;
      return {
        ...state,
        wallet: {
          balance: state.wallet.balance + action.payload.value,
          cards: [...state.wallet.cards, action.payload],
        },
      };
    }
    case 'RESET_BOOKING':
      return { ...state, selectedCruise: null, selectedCabin: null, guestDetails: initialState.guestDetails, booking: null };
    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
