 import { create } from "zustand";

const useWorkspaceStore = create((set) => ({
  workspaces: [],
  currentWorkspace: null,
  messages: [],
  tasks: [],

  setWorkspaces: (workspaces) => set({ workspaces }),
  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setTasks: (tasks) => set({ tasks }),
}));

export default useWorkspaceStore;