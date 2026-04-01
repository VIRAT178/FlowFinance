import { createContext, useEffect, useMemo, useState } from "react";
import { apiRequest, clearStoredToken, getStoredToken, setStoredToken } from "../lib/api";

export const FinanceContext = createContext();

const initialState = {
  currentUser: null,
  transactions: [],
  filter: "all",
  loading: true,
  authMessage: "",
  error: "",
};

export const FinanceProvider = ({ children }) => {
  const [state, setState] = useState(initialState);

  const loadSession = async () => {
    const token = getStoredToken();

    if (!token) {
      setState((currentState) => ({ ...currentState, loading: false }));
      return;
    }

    try {
      const session = await apiRequest("/me", { token });

      setState((currentState) => ({
        ...currentState,
        currentUser: session.user,
        transactions: session.transactions ?? [],
        loading: false,
        authMessage: "",
        error: "",
      }));
    } catch (error) {
      clearStoredToken();
      setState((currentState) => ({
        ...currentState,
        currentUser: null,
        transactions: [],
        loading: false,
        error: error.message,
      }));
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

  const updateSession = (session) => {
    setStoredToken(session.token);
    setState((currentState) => ({
      ...currentState,
      currentUser: session.user,
      transactions: session.transactions ?? [],
      loading: false,
      authMessage: "",
      error: "",
    }));
  };

  const register = async ({ fullName, email, password }) => {
    setState((currentState) => ({ ...currentState, loading: true, authMessage: "", error: "" }));

    try {
      const session = await apiRequest("/auth/register", {
        method: "POST",
        body: { fullName, email, password },
      });

      updateSession(session);
    } catch (error) {
      setState((currentState) => ({
        ...currentState,
        loading: false,
        authMessage: error.message,
      }));
    }
  };

  const signIn = async ({ email, password }) => {
    setState((currentState) => ({ ...currentState, loading: true, authMessage: "", error: "" }));

    try {
      const session = await apiRequest("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      updateSession(session);
    } catch (error) {
      setState((currentState) => ({
        ...currentState,
        loading: false,
        authMessage: error.message,
      }));
    }
  };

  const signOut = () => {
    clearStoredToken();
    setState((currentState) => ({
      ...currentState,
      currentUser: null,
      transactions: [],
      loading: false,
      authMessage: "",
      error: "",
    }));
  };

  const updateProfile = async (profileData) => {
    const response = await apiRequest("/me/profile", {
      method: "PUT",
      body: profileData,
    });

    setState((currentState) => ({
      ...currentState,
      currentUser: response.user,
    }));
  };

  const addTransaction = async (transactionData) => {
    const response = await apiRequest("/transactions", {
      method: "POST",
      body: transactionData,
    });

    setState((currentState) => ({
      ...currentState,
      transactions: [response.transaction, ...currentState.transactions],
    }));
  };

  const updateTransaction = async (transactionData) => {
    const response = await apiRequest(`/transactions/${transactionData.id}`, {
      method: "PUT",
      body: transactionData,
    });

    setState((currentState) => ({
      ...currentState,
      transactions: currentState.transactions.map((transaction) =>
        transaction.id === response.transaction.id ? response.transaction : transaction
      ),
    }));
  };

  const deleteTransaction = async (transactionId) => {
    await apiRequest(`/transactions/${transactionId}`, {
      method: "DELETE",
    });

    setState((currentState) => ({
      ...currentState,
      transactions: currentState.transactions.filter(
        (transaction) => transaction.id !== transactionId
      ),
    }));
  };

  const setFilter = (filter) => {
    setState((currentState) => ({
      ...currentState,
      filter,
    }));
  };

  const currentUser = state.currentUser;
  const currentTransactions = state.transactions;

  return (
    <FinanceContext.Provider
      value={{
        state,
        currentUser,
        currentTransactions,
        isAuthenticated: Boolean(currentUser),
        loading: state.loading,
        authMessage: state.authMessage,
        error: state.error,
        register,
        signIn,
        signOut,
        updateProfile,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        setFilter,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};