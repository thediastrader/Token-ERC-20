export interface SkillData {
  id: number
  name: string
  icon: string
  tier: 1 | 2 | 3
  description: string
}

export const SKILLS: SkillData[] = [
  { id: 1, name: 'Hello World',     icon: '🌱', tier: 1, description: 'Primeiro projeto deployado' },
  { id: 2, name: 'Vibe Coder',      icon: '🤝', tier: 1, description: 'Primeiro projeto com Claude' },
  { id: 3, name: 'Documentador',    icon: '📄', tier: 1, description: 'Primeiro CLAUDE.md criado' },
  { id: 4, name: 'On-Chain',        icon: '⚡', tier: 2, description: 'Primeiro contrato deployado na Base' },
  { id: 5, name: 'UI Builder',      icon: '🎨', tier: 2, description: 'Primeiro frontend funcional' },
  { id: 6, name: 'Integrador',      icon: '🔗', tier: 2, description: 'Conectou API externa num projeto' },
  { id: 7, name: 'App do Zero',     icon: '🏗️', tier: 3, description: 'Habits app completo' },
  { id: 8, name: 'Builder Público', icon: '📹', tier: 3, description: 'Documentou projeto no canal' },
  { id: 9, name: 'Open Source',     icon: '🌐', tier: 3, description: 'Primeiro repositório público' },
]

export const TIER_LABELS: Record<1 | 2 | 3, string> = {
  1: 'INICIANTE',
  2: 'CONSTRUTOR',
  3: 'CRIADOR',
}

export const TIER_ROMAN: Record<1 | 2 | 3, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
}

export const TIER_ACCENT: Record<1 | 2 | 3, string> = {
  1: '#3a7a4a',
  2: '#4a6aaa',
  3: '#8a5aaa',
}
