import type { Dayjs } from 'dayjs'

/**
 * Returns true when the value is greater than minValue, hence fulfilling min constraint
 */
export function minValueValidator(minValue: number, value: number, label: string = 'value'): Promise<void> {
  if (value >= minValue) {
    return Promise.resolve()
  }
  return Promise.reject(new Error(`${label} is less than ${minValue}`))
}

/**
 * Returns true when the value is less than maxValue, hence fulfilling max constraint
 */
export function maxValueValidator(maxValue: number, value: number, label: string = 'value'): Promise<void> {
  if (value <= maxValue) {
    return Promise.resolve()
  }
  return Promise.reject(new Error(`${label} is greater than ${maxValue}`))
}

/**
 * Returns true when the value is greater than minDate, hence fulfilling min constraint
 */
export function minDateValidator(minDate: Dayjs, date: Dayjs, label: string = 'date'): Promise<void> {
  if (date >= minDate) {
    return Promise.resolve()
  }
  return Promise.reject(new Error(`${label} is less than ${minDate}`))
}

/**
 * Returns true when the date is less than maxDate, hence fulfilling max constraint
 */
export function maxDateValidator(maxDate: Dayjs, date: Dayjs, label: string = 'date'): Promise<void> {
  if (date <= maxDate) {
    return Promise.resolve()
  }
  return Promise.reject(new Error(`${label} is greater than ${maxDate}`))
}
