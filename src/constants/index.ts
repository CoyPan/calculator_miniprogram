// 页面常量
export const PAGE_TITLE = '生活算力';
export const PAGE_SUBTITLE = '生活不靠猜，关键算出来';

// 定义计算器类型
export interface CalculatorItem {
  name: string;
  description: string;
  path: string;
  icon: string; // 使用base64格式的SVG图标
  type: 'finance' | 'life' | 'fun' | 'time';
  fullWidth?: boolean;
}

// 计算器列表数据
export const calculators: CalculatorItem[] = [
  {
    name: '投资收益',
    description: '小钱钱涨涨涨',
    path: '/pages/investment/index',
    icon: 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%233D4446%27 stroke-width=%271.5%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27M12 2v20M17 5l-5-3-5 3M9 19l3 3 3-3%27/%3E%3Ccircle cx=%2712%27 cy=%2712%27 r=%274%27/%3E%3C/svg%3E',
    type: 'finance',
  },
  {
    name: '健康BMI',
    description: '保持好身材哦',
    path: '/pages/bmi/index',
    icon: 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%233D4446%27 stroke-width=%271.5%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27M5 5c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5z%27/%3E%3Ccircle cx=%2712%27 cy=%2710%27 r=%273%27/%3E%3Cpath d=%27M9 17h6%27/%3E%3C/svg%3E',
    type: 'life',
  },
  {
    name: '亲戚关系',
    description: '过年不再头大',
    path: '/pages/relationship/index',
    icon: 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%233D4446%27 stroke-width=%271.5%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z%27/%3E%3C/svg%3E',
    type: 'fun',
  },
];

// 额外的计算器（目前为空）
export const additionalCalculators: CalculatorItem[] = [];

// 合并所有计算器
export const allCalculators = [...calculators, ...additionalCalculators];
