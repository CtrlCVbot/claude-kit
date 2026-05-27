export type RuntimeTarget = 'Claude' | 'Codex'

export type RuntimeInfo = {
  target: RuntimeTarget
  summary: string
  assets: string[]
  notes: string[]
}

export type PlanningPage = {
  slug: string
  command: string
  phase: string
  title: string
  description: string
  purpose: string
  whenToUse: string[]
  inputs: string[]
  outputs: string[]
  lifecycle: string[]
  rules: string[]
  runtimes: RuntimeInfo[]
}

export type ExamplePage = {
  slug: string
  title: string
  description: string
  sections: Array<{
    title: string
    body: string
    items?: string[]
  }>
}
