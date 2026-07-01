export interface TimeSlot {
  startAt: Date
  endAt: Date
}

export interface ScheduleEntry {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export function getAvailableSlots(
  date: Date,
  schedules: ScheduleEntry[],
  bookedSlots: TimeSlot[],
  serviceDurationMin: number,
  slotGapMinutes = 30,
): TimeSlot[] {
  const dayOfWeek = date.getDay()
  const workSchedule = schedules.find((s) => s.dayOfWeek === dayOfWeek)

  if (!workSchedule) return []

  const [startHour, startMin] = workSchedule.startTime.split(':').map(Number)
  const [endHour, endMin] = workSchedule.endTime.split(':').map(Number)

  const windowStart = new Date(date)
  windowStart.setHours(startHour, startMin, 0, 0)

  const windowEnd = new Date(date)
  windowEnd.setHours(endHour, endMin, 0, 0)

  const slots: TimeSlot[] = []
  const slotMs = serviceDurationMin * 60 * 1000
  const gapMs = slotGapMinutes * 60 * 1000
  let cursor = windowStart.getTime()

  while (cursor + slotMs <= windowEnd.getTime()) {
    const slotStart = new Date(cursor)
    const slotEnd = new Date(cursor + slotMs)

    const hasConflict = bookedSlots.some(
      (booked) => slotStart < booked.endAt && slotEnd > booked.startAt,
    )

    if (!hasConflict) {
      slots.push({ startAt: slotStart, endAt: slotEnd })
    }

    cursor += gapMs
  }

  return slots
}

export function hasConflict(proposed: TimeSlot, existing: TimeSlot[]): boolean {
  return existing.some(
    (slot) => proposed.startAt < slot.endAt && proposed.endAt > slot.startAt,
  )
}
