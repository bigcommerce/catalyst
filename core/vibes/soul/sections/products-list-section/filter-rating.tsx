import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs'

import { Checkbox } from '@/vibes/soul/form/checkbox'
import { Rating } from '@/vibes/soul/primitives/rating'

interface Props {
  paramName: string
}

export function FilterRating({ paramName }: Props) {
  const [param, setParam] = useQueryState(
    paramName,
    parseAsArrayOf(parseAsString).withOptions({ shallow: false })
  )

  return (
    <div className="space-y-3">
      {[5, 4, 3, 2, 1].map(rating => (
        <Checkbox
          key={rating}
          id={`${paramName}-${rating}`}
          label={<Rating showRating={false} rating={rating} />}
          checked={param?.includes(rating.toString()) ?? false}
          onCheckedChange={value =>
            void setParam(prev => {
              const next =
                value === true
                  ? [...(prev ?? []), rating.toString()]
                  : (prev ?? []).filter(v => v !== rating.toString())

              return next.length > 0 ? next : null
            })
          }
        />
      ))}
    </div>
  )
}
