/**
 * Typed Redux Hooks
 *
 * Pre-typed versions of useDispatch and useSelector hooks for type safety
 * These should be used instead of plain Redux hooks throughout the application
 */

import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './index'

// Typed useDispatch hook with thunk support
export const useAppDispatch = () => useDispatch<AppDispatch>()

// Typed useSelector hook with full IntelliSense
export const useAppSelector = <TSelected,>(
  selector: (state: RootState) => TSelected
): TSelected => useSelector<RootState, TSelected>(selector)
