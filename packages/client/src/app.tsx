import { Button, Layout, Menu, Result, Spin } from 'antd'
import { FileTextOutlined, FolderOpenOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { useQuery } from 'react-query'
import { useCallback, useState } from 'react'
import { Route } from '@scripter/core'
import { fetchFunctionRoutes } from './queries/functions'

export default function App() {
  const { data, isLoading, isError } = useQuery(['function-routes'], fetchFunctionRoutes)

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const renderRoute = useCallback((route: Route) => {
    if (route.type === 'function') {
      return (
        <Menu.Item key={route.route} icon={<FileTextOutlined />}>
          {route.title}
        </Menu.Item>
      )
    }

    if (route.type === 'module') {
      return (
        <Menu.SubMenu key={route.route} icon={<FolderOpenOutlined />} title={route.title}>
          {route.children.map(renderRoute)}
        </Menu.SubMenu>
      )
    }

    return null
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <Spin tip="Bootstrapping..." />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <Result status="warning" title="Something went wrong" subTitle="Please try again" />
      </div>
    )
  }

  if (data) {
    return (
      <Layout className="h-screen">
        <Layout.Sider width={240} collapsible theme="dark" collapsed={sidebarCollapsed} trigger={null}>
          <Menu mode="inline" theme="dark">
            {data.map(renderRoute)}
          </Menu>
        </Layout.Sider>
        <Layout>
          <Layout.Header className="!bg-white border-b !px-4">
            <Button
              icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              type="ghost"
              onClick={() => {
                setSidebarCollapsed((prevState) => !prevState)
              }}
            />
          </Layout.Header>
        </Layout>
      </Layout>
    )
  }

  return null
}
