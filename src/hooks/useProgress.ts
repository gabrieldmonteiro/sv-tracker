import { useCallback, useEffect, useRef, useState } from 'react'
import {
  emptyProgress,
  loadProgress,
  saveProgress,
  subtaskKey,
  type LoadStatus,
  type ProgressState,
} from '@/lib/storage'

function toggleKey(record: Record<string, true>, key: string): Record<string, true> {
  const next = { ...record }
  if (next[key]) delete next[key]
  else next[key] = true
  return next
}

/** Marks a check change: sets createdAt once, moves updatedAt every time. */
export function stamp(state: ProgressState, now = new Date()): ProgressState {
  const iso = now.toISOString()
  return { ...state, createdAt: state.createdAt ?? iso, updatedAt: iso }
}

export function useProgress() {
  const [initial] = useState(() => loadProgress())
  const [state, setState] = useState<ProgressState>(initial.state)
  const [loadStatus, setLoadStatus] = useState<LoadStatus>(initial.status)
  const [saveFailed, setSaveFailed] = useState(false)
  const persisted = useRef(initial.state)

  useEffect(() => {
    if (state === persisted.current || initial.status === 'unavailable') return
    persisted.current = state
    setSaveFailed(!saveProgress(state))
  }, [state, initial.status])

  const toggleTrophy = useCallback((id: string) => {
    setState((prev) => stamp({ ...prev, trophies: toggleKey(prev.trophies, id) }))
  }, [])

  const toggleSubtask = useCallback((trophyId: string, subtaskId: string) => {
    setState((prev) => stamp({ ...prev, subtasks: toggleKey(prev.subtasks, subtaskKey(trophyId, subtaskId)) }))
  }, [])

  const reset = useCallback(
    () => setState((prev) => (prev.createdAt ? stamp({ ...emptyProgress(), createdAt: prev.createdAt }) : emptyProgress())),
    [],
  )

  /** Replaces progress with an imported save, keeping the file's own dates. */
  const replace = useCallback((next: ProgressState) => setState(next), [])

  const dismissNotice = useCallback(() => {
    setLoadStatus((status) => (status === 'corrupt' ? 'ok' : status))
    setSaveFailed(false)
  }, [])

  return { state, loadStatus, saveFailed, toggleTrophy, toggleSubtask, reset, replace, dismissNotice }
}
