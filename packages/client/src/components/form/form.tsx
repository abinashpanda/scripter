import { Button, Form as AntdForm, Input, InputNumber, Slider, Switch } from 'antd'
import { ParamWithDescription } from '@scripter/core'
import { useCallback } from 'react'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { CheckOutlined, ClearOutlined } from '@ant-design/icons'
import type { Rule } from 'antd/lib/form'
import DatePicker from '../date-picker'
import { maxValueValidator, minValueValidator } from '../../utils/validators'

function isRule(rule: any): rule is Rule {
  return typeof rule !== 'undefined'
}

type FormProps = {
  params: ParamWithDescription[]
  onSubmit?: (data: any) => void
  submitting?: boolean
  className?: string
  style?: React.CSSProperties
}

export default function Form({ params, onSubmit, submitting, className, style }: FormProps) {
  const [form] = AntdForm.useForm()

  const renderParam = useCallback((param: ParamWithDescription) => {
    const { type, label, identifier } = param

    switch (type) {
      case 'string': {
        return (
          <AntdForm.Item
            key={identifier}
            name={identifier}
            label={label}
            rules={[{ required: param.required, message: `${label} is required` }]}
          >
            <Input placeholder={label} />
          </AntdForm.Item>
        )
      }

      case 'number': {
        const { minValue, maxValue, step } = param.meta

        const rules = [
          { required: param.required, message: `${label} is required` },
          typeof minValue !== 'undefined'
            ? { validator: (_: any, value: number) => minValueValidator(minValue!, value, label) }
            : undefined,
          typeof maxValue !== 'undefined'
            ? { validator: (_: any, value: number) => maxValueValidator(maxValue!, value, label) }
            : undefined,
        ].filter(isRule) as Rule[]

        const isSlider =
          typeof maxValue !== 'undefined' && typeof minValue !== 'undefined' && typeof step !== 'undefined'

        if (isSlider) {
          return (
            <AntdForm.Item name={identifier} label={label} rules={rules} key={identifier}>
              <Slider step={step} min={minValue} max={maxValue} />
            </AntdForm.Item>
          )
        }

        return (
          <AntdForm.Item name={identifier} label={label} rules={rules} key={identifier}>
            <InputNumber className="!w-full" placeholder={label} />
          </AntdForm.Item>
        )
      }

      case 'boolean': {
        return (
          <AntdForm.Item
            name={identifier}
            label={label}
            rules={[{ required: param.required, message: `${label} is required` }]}
            key={identifier}
          >
            <Switch />
          </AntdForm.Item>
        )
      }

      case 'date': {
        const { minDate, maxDate } = param.meta
        let minDateValue: Dayjs | undefined
        let maxDateValue: Dayjs | undefined
        if (minDate) {
          if (minDate === 'now') {
            minDateValue = dayjs()
          } else {
            minDateValue = dayjs(minDate)
          }
        }
        if (maxDate) {
          if (maxDate === 'now') {
            maxDateValue = dayjs()
          } else {
            maxDateValue = dayjs(maxDate)
          }
        }

        return (
          <AntdForm.Item
            name={identifier}
            label={label}
            rules={[{ required: param.required, message: `${label} is required` }]}
            key={identifier}
          >
            <DatePicker
              className="w-full"
              disabledDate={(date) => {
                const minConstraint = minDateValue ? date < minDateValue : false
                const maxConstraint = maxDateValue ? date > maxDateValue : false
                return minConstraint || maxConstraint
              }}
            />
          </AntdForm.Item>
        )
      }

      default: {
        return null
      }
    }
  }, [])

  return (
    <AntdForm className={className} style={style} layout="vertical" form={form} onFinish={onSubmit}>
      {params.map(renderParam)}
      <div className="flex items-center space-x-4">
        <Button type="primary" htmlType="submit" icon={<CheckOutlined />} loading={submitting}>
          Submit
        </Button>
        <Button htmlType="reset" icon={<ClearOutlined />}>
          Reset
        </Button>
      </div>
    </AntdForm>
  )
}
