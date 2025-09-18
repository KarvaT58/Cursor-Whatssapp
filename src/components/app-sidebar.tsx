'use client'

import * as React from 'react'
import {
  IconMessageCircle,
  IconUsers,
  IconMessageDots,
  IconSpeakerphone,
  IconSettings,
  IconHelp,
  IconSearch,
  IconLink,
  IconShield,
} from '@tabler/icons-react'

import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import { useAuth } from '@/providers/auth-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  const data = {
    user: {
      name: user?.user_metadata?.name || user?.email || 'Usuário',
      email: user?.email || '',
      avatar: user?.user_metadata?.avatar_url || '/avatars/default.svg',
    },
    navMain: [
      {
        title: 'Contatos',
        url: '/dashboard/contacts',
        icon: IconUsers,
      },
      {
        title: 'Grupos',
        url: '/dashboard/groups',
        icon: IconMessageDots,
      },
      {
        title: 'Links Universais',
        url: '/dashboard/links',
        icon: IconLink,
      },
      {
        title: 'Blacklist',
        url: '/dashboard/blacklist',
        icon: IconShield,
      },
      {
        title: 'Campanhas',
        url: '/dashboard/campaigns',
        icon: IconSpeakerphone,
      },
      {
        title: 'Chat WhatsApp',
        url: '/dashboard/whatsapp',
        icon: IconMessageCircle,
      },
      {
        title: 'Equipe',
        url: '/dashboard/team',
        icon: IconUsers,
      },
    ],
    navSecondary: [
      {
        title: 'Configurações',
        url: '/dashboard/settings',
        icon: IconSettings,
      },
      {
        title: 'Monitor de Filas',
        url: '/dashboard/queues',
        icon: IconSettings,
      },
      {
        title: 'Teste Z-API',
        url: '/dashboard/z-api-test',
        icon: IconSettings,
      },
      {
        title: 'Ajuda',
        url: '/dashboard/help',
        icon: IconHelp,
      },
      {
        title: 'Buscar',
        url: '/dashboard/search',
        icon: IconSearch,
      },
    ],
  }
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconMessageCircle className="!size-5" />
                <span className="text-base font-semibold">
                  WhatsApp Professional
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
