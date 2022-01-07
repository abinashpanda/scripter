import { useCallback, useEffect, useState } from 'react'
import { Button, Layout, Menu } from 'antd'
import type { Route } from '@scripter/core'
import { getFunctionRoutes, getModuleRoutes } from '@scripter/core'
import {
  FileTextOutlined,
  FolderOpenOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { useMatch, useNavigate } from 'react-router-dom'
import { formatRoute } from '../../utils/route'

type AppShellProps = {
  routes: Route[]
  children: React.ReactNode
}

export default function AppShell({ routes, children }: AppShellProps) {
  const navigate = useNavigate()
  const match = useMatch('functions/:route')
  const routeSelected = match?.params?.route

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(
    function redirectUserToFirstRoute() {
      if (!routeSelected) {
        const functionRoutes = getFunctionRoutes(routes)
        if (functionRoutes.length > 0) {
          navigate(`functions/${formatRoute(functionRoutes[0].route)}`)
        }
      }
    },
    // we only want to run it for the first time, so didn't pass routes param
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const renderRoute = useCallback((route: Route) => {
    if (route.type === 'function') {
      return (
        <Menu.Item key={formatRoute(route.route)} icon={<FileTextOutlined />}>
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

  return (
    <Layout className="h-screen">
      <Layout.Sider
        width={240}
        collapsible
        theme="dark"
        collapsed={sidebarCollapsed}
        trigger={null}
        className="overflow-auto"
      >
        <Menu
          mode="inline"
          theme="dark"
          defaultOpenKeys={getModuleRoutes(routes).map((route) => route.route)}
          selectedKeys={routeSelected ? [routeSelected] : undefined}
          onSelect={({ key }) => {
            navigate(`/functions/${key}`)
          }}
        >
          {routes.length > 0 ? (
            routes.map(renderRoute)
          ) : (
            <Menu.Item icon={<WarningOutlined />} disabled>
              No Functions Found
            </Menu.Item>
          )}
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
        <div className="flex-1 p-4 overflow-auto">{children}</div>
      </Layout>
    </Layout>
  )
}
