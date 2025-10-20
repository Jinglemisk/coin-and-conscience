import { createContext, useCallback, useContext, useMemo, useReducer, type PropsWithChildren } from 'react';
import type { ModifierDefinition, ModifiersState } from './modifiersTypes';

interface ModifiersActions {
  addModifier: (modifier: ModifierDefinition) => void;
  removeModifier: (modifierId: string) => void;
  clearModifiers: () => void;
}

type ModifiersContextValue = ModifiersState & ModifiersActions;

const ModifiersContext = createContext<ModifiersContextValue | null>(null);

const modifiersReducer = (state: ModifiersState, action: { type: string; payload?: unknown }): ModifiersState => {
  switch (action.type) {
    case 'add': {
      const modifier = action.payload as ModifierDefinition;
      const exists = state.active.some((item) => item.id === modifier.id);
      if (exists) {
        return state;
      }
      return { active: [...state.active, modifier] };
    }
    case 'remove': {
      const modifierId = action.payload as string;
      return { active: state.active.filter((modifier) => modifier.id !== modifierId) };
    }
    case 'clear':
      return { active: [] };
    default:
      return state;
  }
};

export const ModifiersProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useReducer(modifiersReducer, { active: [] });

  const addModifier = useCallback((modifier: ModifierDefinition) => {
    dispatch({ type: 'add', payload: modifier });
  }, []);

  const removeModifier = useCallback((modifierId: string) => {
    dispatch({ type: 'remove', payload: modifierId });
  }, []);

  const clearModifiers = useCallback(() => {
    dispatch({ type: 'clear' });
  }, []);

  const value = useMemo<ModifiersContextValue>(
    () => ({ active: state.active, addModifier, removeModifier, clearModifiers }),
    [addModifier, clearModifiers, removeModifier, state.active]
  );

  return <ModifiersContext.Provider value={value}>{children}</ModifiersContext.Provider>;
};

export const useModifiers = () => {
  const ctx = useContext(ModifiersContext);
  if (!ctx) {
    throw new Error('useModifiers must be used within a ModifiersProvider');
  }
  return ctx;
};
