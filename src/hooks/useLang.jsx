import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

const LABELS = {
  en: {
    code: 'en',
    label: 'English',
    flag: '🇺🇸',
    nav_library: 'LIBRARY',
    nav_poetry: 'POETRY',
    nav_flash: 'FLASH FICTION',
    hero_eyebrow: 'A Public Library of Stories',
    hero_title: 'WORDS THAT LINGER.',
    hero_sub: 'Short stories, poetry, and flash fiction —\ncurated for the quiet moments. Let the words find you.',
    browse_library: 'Browse the Library',
    find_mood: 'Find by Mood',
    read_now: 'Read Now →',
    clicker: 'CLICKER',
    browse_genre: 'Browse by Genre',
    tonights_pick: '— Tonight\'s Pick —',
    read_in_dark: 'Read in the Dark →',
    coming_soon: 'Coming Soon',
    bookmark: 'Bookmark',
    bookmarked: 'Bookmarked ✓',
    continue_reading: 'Continue Reading',
    reading_list: 'Reading List',
    submit_story: 'Submit Your Story',
    sign_in: 'Sign In',
    join: 'Join',
    sign_out: 'Sign Out',
    enter_library: 'Enter the Library',
    create_account: 'Create Account',
    loading: 'Opening the page...',
    no_content: 'No content yet.',
    upcoming: 'Upcoming Stories',
    arrives: 'Arrives',
  },
  fil: {
    code: 'fil',
    label: 'Filipino',
    flag: '🇵🇭',
    nav_library: 'LIBRARY',
    nav_poetry: 'TULA',
    nav_flash: 'MAIKLING KWENTO',
    hero_eyebrow: 'Isang Pampublikong Aklatan ng mga Kwento',
    hero_title: 'MGA SALITANG NANANATILI.',
    hero_sub: 'Maikling kwento, tula, at flash fiction —\npara sa mga tahimik na sandali. Hayaan ang mga salita.',
    browse_library: 'I-browse ang Library',
    find_mood: 'Hanapin sa Mood',
    read_now: 'Basahin Ngayon →',
    clicker: 'CLICKER',
    browse_genre: 'I-browse ang Genre',
    tonights_pick: '— Pinili Ngayong Gabi —',
    read_in_dark: 'Basahin sa Dilim →',
    coming_soon: 'Paparating',
    bookmark: 'I-bookmark',
    bookmarked: 'Na-bookmark ✓',
    continue_reading: 'Ituloy ang Pagbabasa',
    reading_list: 'Listahan ng Pagbabasa',
    submit_story: 'Isumite ang Iyong Kwento',
    sign_in: 'Mag-sign In',
    join: 'Sumali',
    sign_out: 'Mag-sign Out',
    enter_library: 'Pumasok sa Library',
    create_account: 'Gumawa ng Account',
    loading: 'Binubuksan ang pahina...',
    no_content: 'Wala pang nilalaman.',
    upcoming: 'Mga Paparating na Kwento',
    arrives: 'Darating',
  },
  zh: {
    code: 'zh',
    label: '中文',
    flag: '🇨🇳',
    nav_library: '书库',
    nav_poetry: '诗歌',
    nav_flash: '闪小说',
    hero_eyebrow: '公共故事图书馆',
    hero_title: '萦绕心间的文字。',
    hero_sub: '短篇小说、诗歌与闪小说 —\n为宁静时刻而精心策划。让文字找到你。',
    browse_library: '浏览书库',
    find_mood: '按心情查找',
    read_now: '立即阅读 →',
    clicker: '翻页',
    browse_genre: '按类型浏览',
    tonights_pick: '— 今夜精选 —',
    read_in_dark: '在黑暗中阅读 →',
    coming_soon: '即将上线',
    bookmark: '收藏',
    bookmarked: '已收藏 ✓',
    continue_reading: '继续阅读',
    reading_list: '阅读列表',
    submit_story: '投稿您的故事',
    sign_in: '登录',
    join: '注册',
    sign_out: '退出',
    enter_library: '进入书库',
    create_account: '创建账户',
    loading: '正在打开页面...',
    no_content: '暂无内容。',
    upcoming: '即将上线的故事',
    arrives: '上线时间',
  },
}

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const { user } = useAuth()
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('inkwell_lang') || 'en'
  })

  // Sync from Supabase when user logs in
  useEffect(() => {
    if (!user) return
    supabase
      .from('user_preferences')
      .select('language')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.language) {
          setLangState(data.language)
          localStorage.setItem('inkwell_lang', data.language)
        }
      })
  }, [user])

  async function setLang(code) {
    setLangState(code)
    localStorage.setItem('inkwell_lang', code)
    if (user) {
      await supabase
        .from('user_preferences')
        .upsert({ user_id: user.id, language: code, updated_at: new Date().toISOString() })
    }
  }

  const t = LABELS[lang] || LABELS.en

  return (
    <LangContext.Provider value={{ lang, setLang, t, LABELS }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)