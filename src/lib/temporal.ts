import { Temporal } from 'temporal-polyfill'

export const { Now, Instant, PlainDate, Duration } = Temporal

export type Instant = InstanceType<typeof Temporal.Instant>
export type PlainDate = InstanceType<typeof Temporal.PlainDate>
export type Duration = InstanceType<typeof Temporal.Duration>
