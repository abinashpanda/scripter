import { Button, Form as AntdForm, Input, InputNumber, Slider, Switch } from 'antd'
import { ParamWithDescription } from '@scripter/core'
import { useCallback } from 'react'
import dayjs from 'dayjs'
import { CheckOutlined, ClearOutlined } from '@ant-design/icons'
import type { Rule } from 'antd/lib/form'
import DatePicker from '../date-picker'

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
    switch (param.type) {
      case 'string': {
        return (
          <AntdForm.Item
            name={param.identifier}
            label={param.label}
            rules={[{ required: param.required, message: `${param.label} is required` }]}
          >
            <Input placeholder={param.label} />
          </AntdForm.Item>
        )
      }

      case 'number': {
        const isSlider =
          typeof param.meta.maxValue !== 'undefined' &&
          typeof param.meta.minValue !== 'undefined' &&
          typeof param.meta.step !== 'undefined'

        if (isSlider) {
          return (
            <AntdForm.Item
              name={param.identifier}
              label={param.label}
              rules={[
                { required: param.required, message: `${param.label} is required` },
                { min: param.meta.minValue, max: param.meta.maxValue },
              ]}
            >
              <Slider step={param.meta.step} min={param.meta.minValue} max={param.meta.maxValue} />
            </AntdForm.Item>
          )
        }

        const rules = [
          { required: param.required, message: `${param.label} is required` },
          typeof param.meta.minValue !== 'undefined' ? { min: param.meta.minValue } : undefined,
          typeof param.meta.maxValue !== 'undefined' ? { max: param.meta.maxValue } : undefined,
        ].filter(isRule)

        return (
          <AntdForm.Item name={param.identifier} label={param.label} rules={rules as Rule[]}>
            <InputNumber className="!w-full" placeholder={param.label} />
          </AntdForm.Item>
        )
      }

      case 'boolean': {
        return (
          <AntdForm.Item
            name={param.identifier}
            label={param.label}
            rules={[{ required: param.required, message: `${param.label} is required` }]}
          >
            <Switch />
          </AntdForm.Item>
        )
      }

      case 'date': {
        return (
          <AntdForm.Item
            name={param.identifier}
            label={param.label}
            rules={[{ required: param.required, message: `${param.label} is required` }]}
          >
            <DatePicker
              className="w-full"
              disabledDate={(date) => {
                const minConstraint =
                  typeof param.meta.minDate !== 'undefined' ? date < dayjs(param.meta.minDate) : false
                const maxConstraint =
                  typeof param.meta.maxDate !== 'undefined' ? date > dayjs(param.meta.maxDate) : false
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
