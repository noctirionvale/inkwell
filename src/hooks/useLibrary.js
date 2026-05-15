import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useBookmarks() {
  const { user } = useAuth()
  const [saves, setSaves] = useState(new Set())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) { setSaves(new Set()); return }
    supabase
      .from('user_saves')
      .select('story_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) setSaves(new Set(data.map(r => r.story_id)))
      })
  }, [user])

  const toggle = useCallback(async (storyId) => {
    if (!user) return false // signal: not logged in
    const saved = saves.has(storyId)
    // Optimistic update
    setSaves(prev => {
      const next = new Set(prev)
      saved ? next.delete(storyId) : next.add(storyId)
      return next
    })
    if (saved) {
      await supabase.from('user_saves').delete()
        .eq('user_id', user.id).eq('story_id', storyId)
    } else {
      await supabase.from('user_saves').insert({ user_id: user.id, story_id: storyId })
    }
    return true
  }, [user, saves])

  return { saves, toggle, isSaved: (id) => saves.has(id) }
}

export function useReadingProgress() {
  const { user } = useAuth()
  const [progress, setProgress] = useState({}) // { [storyId]: { paragraph_index, completed } }

  useEffect(() => {
    if (!user) { setProgress({}); return }
    supabase
      .from('reading_progress')
      .select('story_id, paragraph_index, completed, last_read_at')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) {
          const map = {}
          data.forEach(r => { map[r.story_id] = r })
          setProgress(map)
        }
      })
  }, [user])

  const saveProgress = useCallback(async (storyId, paragraphIndex, completed = false) => {
    if (!user) return
    const record = {
      user_id: user.id,
      story_id: storyId,
      paragraph_index: paragraphIndex,
      completed,
      last_read_at: new Date().toISOString(),
    }
    setProgress(prev => ({ ...prev, [storyId]: record }))
    await supabase.from('reading_progress').upsert(record)
  }, [user])

  const getProgress = useCallback((storyId) => progress[storyId] || null, [progress])

  // Stories with progress, sorted by last_read_at
  const continueReading = Object.values(progress)
    .filter(p => !p.completed && p.paragraph_index > 0)
    .sort((a, b) => new Date(b.last_read_at) - new Date(a.last_read_at))

  return { saveProgress, getProgress, continueReading }
}