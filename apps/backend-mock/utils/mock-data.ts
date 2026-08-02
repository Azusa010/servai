export interface TenantInfo {
  code: string;
  id: number;
  name: string;
  status: 'active' | 'disabled';
}

export interface knowledgeBaseInfo {
  description: string;
  id: number;
  name: string;
  status: 'disabled' | 'enabled';
  tenantId: number;
}

export interface KnowledgeDocumentInfo {
  createTime: string;
  createdBy: number;
  id: number;
  knowledgeBaseId: number;
  mimeType: string;
  name: string;
  size: number;
  status:
    | 'archived'
    | 'failed'
    | 'parsing'
    | 'pending_publish'
    | 'published'
    | 'uploading';
  tenantId: number;
}
export interface ChatCitationInfo {
  content: string;
  documentId: number;
  documentName: string;
  knowledgeBaseId: number;
  knowledgeBaseName: string;
}

export interface ChatConversationInfo {
  createTime: string;
  deleted: boolean;
  id: number;
  tenantId: number;
  title: string;
  updateTime: string;
  userId: number;
}

export interface ChatMessageInfo {
  citations: ChatCitationInfo[];
  content: string;
  conversationId: number;
  createTime: string;
  id: number;
  role: 'assistant' | 'user';
}

export interface UserInfo {
  id: number;
  tenantId: number;
  password: string;
  realName: string;
  deptId: number;
  deptName: string;
  roles: string[];
  username: string;
  homePath?: string;
}

export interface TimezoneOption {
  offset: number;
  timezone: string;
}

export type TicketStatus =
  | 'Canceled'
  | 'Closed'
  | 'Pending_Confirmation'
  | 'Processing'
  | 'Suspended'
  | 'Unassigned';

export type TicketPriority = 'P1' | 'P2' | 'P3';

export type TicketSource = 'chat' | 'manual' | 'rule' | 'toc';

export type TicketAction =
  | 'cancel'
  | 'claim'
  | 'close'
  | 'confirm'
  | 'create'
  | 'resolve'
  | 'resume'
  | 'suspend'
  | 'transfer';

export type TicketType =
  | 'complain'
  | 'consult'
  | 'demand'
  | 'fault'
  | 'operation'
  | 'warning';

export interface TicketAttachment {
  id: number;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface TicketConsumer {
  id: number;
  customerName: string;
  contactName: string;
  email: string;
  phone: string;
}

export interface TicketTimeline {
  id: number;
  action: TicketAction;
  actorId: null | number;
  prePICid: null | number;
  afterPICid: null | number;
  preStatus: null | TicketStatus;
  afterStatus: TicketStatus;
  actionTime: string;
  comment: string;
}

export interface TicketInfo {
  id: number;
  ticketNo: string;
  tenantId: number;
  title: string;
  description: string;
  type: TicketType;
  priority: TicketPriority;
  source: TicketSource;
  sourceRef: null | string;
  consumer: TicketConsumer;
  status: TicketStatus;
  PICid: null | number;
  slaDeadline: string;
  attachments: TicketAttachment[];
  timelines: TicketTimeline[];
  creatorId: null | number;
  createTime: string;
  updateTime: string;
}

export const MOCK_TENANTS: TenantInfo[] = [
  {
    code: 'demo',
    id: 1,
    name: '演示企业',
    status: 'active',
  },
  {
    code: 'acme',
    id: 2,
    name: '示例企业',
    status: 'active',
  },
];

export const MOCK_KNOWLEDGE_BASES: knowledgeBaseInfo[] = [
  {
    description: '产品介绍和常见问题',
    id: 1,
    name: '产品知识库',
    status: 'enabled',
    tenantId: 1,
  },
  {
    description: '内部客服处理规范',
    id: 2,
    name: '客服知识库',
    status: 'disabled',
    tenantId: 1,
  },
  {
    description: 'Acme 企业内部知识',
    id: 3,
    name: 'Acme 知识库',
    status: 'enabled',
    tenantId: 2,
  },
];

export const MOCK_KNOWLEDGE_DOCUMENTS: KnowledgeDocumentInfo[] = [];

export const MOCK_CHAT_CONVERSATIONS: ChatConversationInfo[] = [];
export const MOCK_CHAT_MESSAGES: ChatMessageInfo[] = [];

export const MOCK_TICKETS: TicketInfo[] = [
  {
    id: 1,
    ticketNo: 'TK202607290001',
    tenantId: 1,
    title: '登录后无法查看订单',
    description: '客户反馈登录成功后订单列表为空，需要客服协助处理。',
    type: 'fault',
    priority: 'P2',
    source: 'toc',
    sourceRef: 'toc-ticket-10001',
    consumer: {
      id: 1001,
      customerName: '上海示例科技有限公司',
      contactName: '李女士',
      email: 'li@example.com',
      phone: '13800005678',
    },
    status: 'Unassigned',
    PICid: null,
    slaDeadline: '2026-07-30T10:00:00.000Z',
    attachments: [],
    timelines: [
      {
        id: 1,
        action: 'create',
        actorId: null,
        prePICid: null,
        afterPICid: null,
        preStatus: null,
        afterStatus: 'Unassigned',
        actionTime: '2026-07-29T02:00:00.000Z',
        comment: '工单由 ToC 系统自动创建',
      },
    ],
    creatorId: null,
    createTime: '2026-07-29T02:00:00.000Z',
    updateTime: '2026-07-29T02:00:00.000Z',
  },
];

export const MOCK_USERS: UserInfo[] = [
  {
    id: 0,
    tenantId: 1,
    password: '123456',
    realName: 'Vben',
    roles: ['super'],
    username: 'vben',
    homePath: '/dashboard/workspace',
    deptId: 100,
    deptName: '运营管理部',
  },
  {
    id: 1,
    tenantId: 1,
    password: '123456',
    realName: 'Admin',
    roles: ['admin'],
    username: 'admin',
    homePath: '/dashboard/workspace',
    deptId: 101,
    deptName: '客服一组',
  },
  {
    id: 2,
    tenantId: 1,
    password: '123456',
    realName: 'Jack',
    roles: ['user'],
    username: 'jack',
    homePath: '/dashboard/analytics',
    deptId: 102,
    deptName: '技术支持组',
  },
  {
    id: 3,
    tenantId: 2,
    password: '123456',
    realName: 'Acme Admin',
    roles: ['admin'],
    username: 'admin',
    homePath: '/dashboard/workspace',
    deptId: 201,
    deptName: '客服一组',
  },
];
export const MOCK_CODES = [
  // super
  {
    codes: ['AC_100100', 'AC_100110', 'AC_100120', 'AC_100010'],
    tenantId: 1,
    userId: 0,
  },
  {
    // admin
    codes: ['AC_100010', 'AC_100020', 'AC_100030'],
    tenantId: 1,
    userId: 1,
  },
  {
    // user
    codes: ['AC_1000001', 'AC_1000002'],
    tenantId: 1,
    userId: 2,
  },
  {
    // admin
    codes: ['AC_100010', 'AC_100020', 'AC_100030'],
    tenantId: 2,
    userId: 3,
  },
];

const dashboardMenus = [
  {
    meta: {
      order: -1,
      title: 'page.dashboard.title',
    },
    name: 'Dashboard',
    path: '/dashboard',
    redirect: '/dashboard/analytics',
    children: [
      {
        name: 'Analytics',
        path: 'analytics',
        component: '/dashboard/analytics/index',
        meta: {
          affixTab: true,
          title: 'page.dashboard.analytics',
        },
      },
      {
        name: 'Workspace',
        path: 'workspace',
        component: '/dashboard/workspace/index',
        meta: {
          title: 'page.dashboard.workspace',
        },
      },
    ],
  },
  {
    meta: {
      order: 0,
      title: '知识管理',
    },
    name: 'Knowledge',
    path: '/knowledge',
    children: [
      {
        name: 'KnowledgeBase',
        path: 'base',
        component: '/knowledge-base/index',
        meta: {
          title: '知识库',
        },
      },
    ],
  },
  {
    component: '/ai-chat/index',
    meta: {
      order: 1,
      title: 'AI 问答',
    },
    name: 'AIChat',
    path: '/chat',
  },
  {
    component: '/ticket/index',
    meta: {
      order: 2,
      title: '工单管理',
    },
    name: 'Ticket',
    path: '/ticket',
  },
];

const createDemosMenus = (role: 'admin' | 'super' | 'user') => {
  const roleWithMenus = {
    admin: {
      component: '/demos/access/admin-visible',
      meta: {
        icon: 'mdi:button-cursor',
        title: 'demos.access.adminVisible',
      },
      name: 'AccessAdminVisibleDemo',
      path: 'admin-visible',
    },
    super: {
      component: '/demos/access/super-visible',
      meta: {
        icon: 'mdi:button-cursor',
        title: 'demos.access.superVisible',
      },
      name: 'AccessSuperVisibleDemo',
      path: 'super-visible',
    },
    user: {
      component: '/demos/access/user-visible',
      meta: {
        icon: 'mdi:button-cursor',
        title: 'demos.access.userVisible',
      },
      name: 'AccessUserVisibleDemo',
      path: 'user-visible',
    },
  };

  return [
    {
      meta: {
        icon: 'ic:baseline-view-in-ar',
        keepAlive: true,
        order: 1000,
        title: 'demos.title',
      },
      name: 'Demos',
      path: '/demos',
      redirect: '/demos/access',
      children: [
        {
          name: 'AccessDemos',
          path: 'access',
          meta: {
            icon: 'mdi:cloud-key-outline',
            title: 'demos.access.backendPermissions',
          },
          redirect: '/demos/access/page-control',
          children: [
            {
              name: 'AccessPageControlDemo',
              path: 'page-control',
              component: '/demos/access/index',
              meta: {
                icon: 'mdi:page-previous-outline',
                title: 'demos.access.pageAccess',
              },
            },
            {
              name: 'AccessButtonControlDemo',
              path: 'button-control',
              component: '/demos/access/button-control',
              meta: {
                icon: 'mdi:button-cursor',
                title: 'demos.access.buttonControl',
              },
            },
            {
              name: 'AccessMenuVisible403Demo',
              path: 'menu-visible-403',
              component: '/demos/access/menu-visible-403',
              meta: {
                authority: ['no-body'],
                icon: 'mdi:button-cursor',
                menuVisibleWithForbidden: true,
                title: 'demos.access.menuVisible403',
              },
            },
            roleWithMenus[role],
          ],
        },
      ],
    },
  ];
};

export const MOCK_MENUS = [
  {
    menus: [...dashboardMenus, ...createDemosMenus('super')],
    tenantId: 1,
    userId: 0,
  },
  {
    menus: [...dashboardMenus, ...createDemosMenus('admin')],
    tenantId: 1,
    userId: 1,
  },
  {
    menus: [...dashboardMenus, ...createDemosMenus('user')],
    tenantId: 1,
    userId: 2,
  },
  {
    menus: [...dashboardMenus, ...createDemosMenus('admin')],
    tenantId: 2,
    userId: 3,
  },
];

export const MOCK_MENU_LIST = [
  {
    id: 1,
    name: 'Dashboard',
    status: 1,
    type: 'catalog',
    icon: 'lucide:layout-dashboard',
    path: '/dashboard',
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: 'page.dashboard.title',
    },
    children: [
      {
        id: 101,
        pid: 1,
        status: 1,
        type: 'menu',
        name: 'Analytics',
        path: 'analytics',
        component: '/dashboard/analytics/index',
        meta: {
          affixTab: true,
          icon: 'lucide:area-chart',
          title: 'page.dashboard.analytics',
          keepAlive: true,
        },
      },
      {
        id: 102,
        pid: 1,
        status: 1,
        type: 'menu',
        name: 'Workspace',
        path: 'workspace',
        component: '/views/dashboard/workspace/index',
        meta: {
          icon: 'carbon:workspace',
          title: 'page.dashboard.workspace',
        },
      },
    ],
  },
  {
    id: 2,
    meta: {
      icon: 'carbon:settings',
      order: 9997,
      title: 'system.title',
      badge: 'new',
      badgeType: 'normal',
      badgeVariants: 'primary',
    },
    status: 1,
    type: 'catalog',
    name: 'System',
    path: '/system',
    children: [
      {
        id: 201,
        pid: 2,
        path: '/system/menu',
        name: 'SystemMenu',
        authCode: 'System:Menu:List',
        status: 1,
        type: 'menu',
        meta: {
          icon: 'carbon:menu',
          title: 'system.menu.title',
        },
        component: '/system/menu/list',
        children: [
          {
            id: 20_101,
            pid: 201,
            name: 'SystemMenuCreate',
            status: 1,
            type: 'button',
            authCode: 'System:Menu:Create',
            meta: { title: 'common.create' },
          },
          {
            id: 20_102,
            pid: 201,
            name: 'SystemMenuEdit',
            status: 1,
            type: 'button',
            authCode: 'System:Menu:Edit',
            meta: { title: 'common.edit' },
          },
          {
            id: 20_103,
            pid: 201,
            name: 'SystemMenuDelete',
            status: 1,
            type: 'button',
            authCode: 'System:Menu:Delete',
            meta: { title: 'common.delete' },
          },
        ],
      },
      {
        id: 202,
        pid: 2,
        path: '/system/dept',
        name: 'SystemDept',
        status: 1,
        type: 'menu',
        authCode: 'System:Dept:List',
        meta: {
          icon: 'carbon:container-services',
          title: 'system.dept.title',
        },
        component: '/system/dept/list',
        children: [
          {
            id: 20_401,
            pid: 202,
            name: 'SystemDeptCreate',
            status: 1,
            type: 'button',
            authCode: 'System:Dept:Create',
            meta: { title: 'common.create' },
          },
          {
            id: 20_402,
            pid: 202,
            name: 'SystemDeptEdit',
            status: 1,
            type: 'button',
            authCode: 'System:Dept:Edit',
            meta: { title: 'common.edit' },
          },
          {
            id: 20_403,
            pid: 202,
            name: 'SystemDeptDelete',
            status: 1,
            type: 'button',
            authCode: 'System:Dept:Delete',
            meta: { title: 'common.delete' },
          },
        ],
      },
    ],
  },
  {
    id: 9,
    meta: {
      badgeType: 'dot',
      order: 9998,
      title: 'demos.vben.title',
      icon: 'carbon:data-center',
    },
    name: 'Project',
    path: '/vben-admin',
    type: 'catalog',
    status: 1,
    children: [
      {
        id: 901,
        pid: 9,
        name: 'VbenDocument',
        path: '/vben-admin/document',
        component: 'IFrameView',
        type: 'embedded',
        status: 1,
        meta: {
          icon: 'carbon:book',
          iframeSrc: 'https://doc.vben.pro',
          title: 'demos.vben.document',
        },
      },
      {
        id: 902,
        pid: 9,
        name: 'VbenGithub',
        path: '/vben-admin/github',
        component: 'IFrameView',
        type: 'link',
        status: 1,
        meta: {
          icon: 'carbon:logo-github',
          link: 'https://github.com/vbenjs/vue-vben-admin',
          title: 'Github',
        },
      },
      {
        id: 903,
        pid: 9,
        name: 'VbenAntdv',
        path: '/vben-admin/antdv',
        component: 'IFrameView',
        type: 'link',
        status: 0,
        meta: {
          icon: 'carbon:hexagon-vertical-solid',
          badgeType: 'dot',
          link: 'https://ant.vben.pro',
          title: 'demos.vben.antdv',
        },
      },
    ],
  },
  {
    id: 10,
    component: '_core/about/index',
    type: 'menu',
    status: 1,
    meta: {
      icon: 'lucide:copyright',
      order: 9999,
      title: 'demos.vben.about',
    },
    name: 'About',
    path: '/about',
  },
];

export function getMenuIds(menus: any[]) {
  const ids: number[] = [];
  menus.forEach((item) => {
    ids.push(item.id);
    if (item.children && item.children.length > 0) {
      ids.push(...getMenuIds(item.children));
    }
  });
  return ids;
}

/**
 * 时区选项
 */
export const TIME_ZONE_OPTIONS: TimezoneOption[] = [
  {
    offset: -5,
    timezone: 'America/New_York',
  },
  {
    offset: 0,
    timezone: 'Europe/London',
  },
  {
    offset: 8,
    timezone: 'Asia/Shanghai',
  },
  {
    offset: 9,
    timezone: 'Asia/Tokyo',
  },
  {
    offset: 9,
    timezone: 'Asia/Seoul',
  },
];
