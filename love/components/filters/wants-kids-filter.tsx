import { ReactNode } from 'react'
import { MdNoStroller, MdOutlineStroller, MdStroller } from 'react-icons/md'
import { Row } from 'web/components/layout/row'
import { ChoicesToggleGroup } from 'web/components/widgets/choices-toggle-group'
import { FilterFields } from './search'
import { hasKidsLabels } from './has-kids-filter'

interface KidLabel {
  name: string
  shortName: string
  icon: ReactNode
  strength: number
}

interface KidsLabelsMap {
  [key: string]: KidLabel
}

export type wantsKidsDatabase = 0 | 1 | 2 | 3 | 4

export function wantsKidsToHasKidsFilter(wantsKidsStrength: wantsKidsDatabase) {
  if (wantsKidsStrength < wantsKidsLabels.wants_kids.strength) {
    return hasKidsLabels.doesnt_have_kids.value
  }
  return hasKidsLabels.no_preference.value
}

export function wantsKidsDatabaseToWantsKidsFilter(
  wantsKidsStrength: wantsKidsDatabase
) {
  if (wantsKidsStrength > wantsKidsLabels.wants_kids.strength) {
    return wantsKidsLabels.wants_kids.strength
  }
  if (wantsKidsStrength < wantsKidsLabels.wants_kids.strength) {
    return wantsKidsLabels.doesnt_want_kids.strength
  }
  return wantsKidsLabels.no_preference.strength
}

export const wantsKidsLabels: KidsLabelsMap = {
  no_preference: {
    name: 'No preference',
    shortName: 'Either',
    icon: <MdOutlineStroller className="h-4 w-4" />,
    strength: -1,
  },
  wants_kids: {
    name: 'Wants kids',
    shortName: 'Yes',
    icon: <MdStroller className="h-4 w-4" />,
    strength: 2,
  },
  doesnt_want_kids: {
    name: `Doesn't want kids`,
    shortName: 'No',
    icon: <MdNoStroller className="h-4 w-4" />,
    strength: 0,
  },
}

const generateChoicesMap = (labels: KidsLabelsMap): Record<string, number> => {
  return Object.values(labels).reduce(
    (acc: Record<string, number>, label: KidLabel) => {
      acc[label.shortName] = label.strength
      return acc
    },
    {}
  )
}

export function KidsLabel(props: {
  strength: number
  highlightedClass?: string
}) {
  const { strength, highlightedClass } = props
  return (
    <Row className="items-center gap-0.5">
      {strength == wantsKidsLabels.no_preference.strength
        ? wantsKidsLabels.no_preference.icon
        : strength == wantsKidsLabels.wants_kids.strength
        ? wantsKidsLabels.wants_kids.icon
        : wantsKidsLabels.doesnt_want_kids.icon}
      <span className={highlightedClass}>
        {strength == wantsKidsLabels.no_preference.strength
          ? wantsKidsLabels.no_preference.name
          : strength == wantsKidsLabels.wants_kids.strength
          ? wantsKidsLabels.wants_kids.name
          : wantsKidsLabels.doesnt_want_kids.name}
      </span>
    </Row>
  )
}

export function WantsKidsFilter(props: {
  filters: Partial<FilterFields>
  updateFilter: (newState: Partial<FilterFields>) => void
}) {
  const { filters, updateFilter } = props

  return (
    <ChoicesToggleGroup
      currentChoice={filters.wants_kids_strength ?? 0}
      choicesMap={generateChoicesMap(wantsKidsLabels)}
      setChoice={(c) => updateFilter({ wants_kids_strength: Number(c) })}
      toggleClassName="w-1/3 justify-center"
    />
  )
}
