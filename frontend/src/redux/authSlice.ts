import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem('authToken'),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      localStorage.setItem('authToken', action.payload);
    },
    clearAuthToken(state) {
      state.token = null;
      localStorage.removeItem('authToken');
    },
  },
});

export const { setAuthToken, clearAuthToken } = authSlice.actions;
export default authSlice.reducer;
