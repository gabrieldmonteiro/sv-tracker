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
    setState((prev) => ({ ...prev, trophies: toggleKey(prev.trophies, id) }))
  }, [])

  const toggleSubtask = useCallback((trophyId: string, subtaskId: string) => {
    setState((prev) => ({ ...prev, subtasks: toggleKey(prev.subtasks, subtaskKey(trophyId, subtaskId)) }))
  }, [])

  const reset = useCallback(() => setState(emptyProgress()), [])

  const dismissNotice = useCallback(() => {
    setLoadStatus((status) => (status === 'corrupt' ? 'ok' : status))
    setSaveFailed(false)
  }, [])

  return { state, loadStatus, saveFailed, toggleTrophy, toggleSubtask, reset, dismissNotice }
}
