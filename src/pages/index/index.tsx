import React, { useEffect, useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import { navigateTo } from '@tarojs/taro';
import './index.less';
import { PAGE_TITLE, PAGE_SUBTITLE, allCalculators, CalculatorItem } from '../../constants/index';

const Index: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animateCards, setAnimateCards] = useState<string[]>([]);

  useEffect(() => {
    // 页面加载时显示内容
    setIsVisible(true);
    
    // 卡片依次进入动画
    const timer = setTimeout(() => {
      setAnimateCards(allCalculators.map(c => c.name));
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = (path: string) => {
    navigateTo({ url: path });
  };

  return (
    <View className={`index ${isVisible ? 'fade-in' : ''}`}>
      <View className={`header ${isVisible ? 'slide-down' : ''}`}>
        <Text className="title">{PAGE_TITLE}</Text>
        <Text className="subtitle">{PAGE_SUBTITLE}</Text>
      </View>
      <View className="calculator-list">
        {allCalculators.map((calculator, index) => (
          <View
            key={calculator.name}
            className={`calculator-card ${calculator.type} ${calculator.fullWidth ? 'full-width' : ''} ${animateCards.includes(calculator.name) ? `card-enter` : ''}`}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => handleNavigate(calculator.path)}
          >
            <View className="icon" style={{ backgroundImage: `url('${calculator.icon}')` }}></View>
            <View>
              <Text className="name">{calculator.name}</Text>
              <Text className="description">{calculator.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default Index;
