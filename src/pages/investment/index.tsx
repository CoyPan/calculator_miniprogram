import React, { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import './index.less';

const InvestmentCalculator: React.FC = () => {
  // 投资参数状态
  const [years, setYears] = useState<string>('10');
  const [initialAmount, setInitialAmount] = useState<string>('10000');
  const [monthlyInvestment, setMonthlyInvestment] = useState<string>('1000');
  
  // 计算结果状态
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [inputAnnualRate, setInputAnnualRate] = useState<string>('5');
  const [finalAmount, setFinalAmount] = useState<string>('');
  const [resultAnnualRate, setResultAnnualRate] = useState<string>('');
  
  // 计算方式选择状态
  const [calculateType, setCalculateType] = useState<number | null>(null); // 1: 计算最终金额, 2: 计算收益率

  // 计算最终金额（已知收益率）
  const calculateFinalAmount = (yearsParam: string, initialAmountParam: string, monthlyInvestmentParam: string, inputAnnualRateParam: string) => {
    console.log('开始计算最终金额');
    console.log('当前参数:', { yearsParam, initialAmountParam, monthlyInvestmentParam, inputAnnualRateParam });
    
    // 转换为数字，使用默认值处理空输入
    const yearsNum = parseFloat(yearsParam) || 1;
    const initialAmountNum = parseFloat(initialAmountParam) || 0;
    const monthlyInvestmentNum = parseFloat(monthlyInvestmentParam) || 0;
    const annualRateNum = (parseFloat(inputAnnualRateParam) || 0) / 100;
    
    console.log('转换后数字:', { yearsNum, initialAmountNum, monthlyInvestmentNum, annualRateNum });
    
    // 计算初始本金的复利增长
    const initialGrowth = initialAmountNum * Math.pow(1 + annualRateNum, yearsNum);
    
    // 计算每月定投的年金终值
    let monthlyGrowth = 0;
    if (annualRateNum > 0) {
      monthlyGrowth = monthlyInvestmentNum * 12 * ((Math.pow(1 + annualRateNum, yearsNum) - 1) / annualRateNum);
    } else {
      monthlyGrowth = monthlyInvestmentNum * 12 * yearsNum;
    }
    
    const total = initialGrowth + monthlyGrowth;
    const formattedTotal = total.toFixed(2);
    
    console.log('计算结果:', { initialGrowth, monthlyGrowth, total, formattedTotal });
    
    setFinalAmount(formattedTotal);
  };

  // 计算收益率（已知目标金额）
  const calculateAnnualRate = (yearsParam: string, initialAmountParam: string, monthlyInvestmentParam: string, targetAmountParam: string) => {
    console.log('开始计算年化收益率');
    console.log('当前参数:', { yearsParam, initialAmountParam, monthlyInvestmentParam, targetAmountParam });
    
    // 转换为数字，使用默认值处理空输入
    const yearsNum = parseFloat(yearsParam) || 1;
    const initialAmountNum = parseFloat(initialAmountParam) || 0;
    const monthlyInvestmentNum = parseFloat(monthlyInvestmentParam) || 0;
    const targetAmountNum = parseFloat(targetAmountParam) || initialAmountNum + monthlyInvestmentNum * 12 * yearsNum;
    
    console.log('转换后数字:', { yearsNum, initialAmountNum, monthlyInvestmentNum, targetAmountNum });
    
    // 确保目标金额有意义
    const minTarget = initialAmountNum + monthlyInvestmentNum * 12 * yearsNum;
    const effectiveTarget = Math.max(targetAmountNum, minTarget + 1);

    // 定义函数f(r) = 初始本金增长 + 定投增长 - 目标金额
    const f = (r: number) => {
      if (r === 0) {
        // 收益率为0时的特殊处理
        return initialAmountNum + monthlyInvestmentNum * 12 * yearsNum - effectiveTarget;
      }
      const initialGrowth = initialAmountNum * Math.pow(1 + r, yearsNum);
      const monthlyGrowth = monthlyInvestmentNum * 12 * ((Math.pow(1 + r, yearsNum) - 1) / r);
      return initialGrowth + monthlyGrowth - effectiveTarget;
    };

    // 定义导数f'(r)
    const df = (r: number) => {
      if (r === 0) {
        // 收益率为0时的导数特殊处理
        return 0;
      }
      const initialGrowthDerivative = initialAmountNum * yearsNum * Math.pow(1 + r, yearsNum - 1);
      const term1 = monthlyInvestmentNum * 12 * yearsNum * Math.pow(1 + r, yearsNum - 1) / r;
      const term2 = monthlyInvestmentNum * 12 * (Math.pow(1 + r, yearsNum) - 1) / (r * r);
      const monthlyGrowthDerivative = term1 - term2;
      return initialGrowthDerivative + monthlyGrowthDerivative;
    };

    // 牛顿迭代法求解
    let r = 0.05; // 初始猜测值5%
    const maxIterations = 100;
    const tolerance = 0.0001;

    for (let i = 0; i < maxIterations; i++) {
      const fValue = f(r);
      const dfValue = df(r);

      // 避免除以零
      if (Math.abs(dfValue) < 1e-10) {
        break;
      }

      const delta = fValue / dfValue;
      r -= delta;

      // 检查收敛
      if (Math.abs(delta) < tolerance) {
        break;
      }
    }

    // 转换为百分比并格式化结果（保留两位小数）
    setResultAnnualRate((r * 100).toFixed(2));
  };

  return (
    <View className="investment-calculator">
      <View className="calculator-container">
        <Text className="title">投资收益计算器</Text>
        
        {/* 基础参数输入 */}
        <View className="input-section">
          <Text className="section-title">基础参数</Text>
          
          <View className="input-item">
            <Text className="label">投资年限（年）</Text>
            <Input
              className="input"
              type="digit"
              value={years}
              onInput={(e) => {
                setYears(e.detail.value);
                // 修改核心参数时清除所有结果
                setFinalAmount('');
                setResultAnnualRate('');
              }}
              placeholder="请输入投资年限"
            />
          </View>

          <View className="input-item">
            <Text className="label">起始本金（元）</Text>
            <Input
              className="input"
              type="digit"
              value={initialAmount}
              onInput={(e) => {
                setInitialAmount(e.detail.value);
                // 修改核心参数时清除所有结果
                setFinalAmount('');
                setResultAnnualRate('');
              }}
              placeholder="请输入起始本金"
            />
          </View>

          <View className="input-item">
            <Text className="label">每月定投金额（元）</Text>
            <Input
              className="input"
              type="digit"
              value={monthlyInvestment}
              onInput={(e) => {
                setMonthlyInvestment(e.detail.value);
                // 修改核心参数时清除所有结果
                setFinalAmount('');
                setResultAnnualRate('');
              }}
              placeholder="请输入每月定投金额"
            />
          </View>
        </View>

        {/* 计算方式选择 */}
        <View className="calculate-section">
          {!calculateType ? (
            <View className="calculate-method">
              <Text className="section-title">请选择计算方式</Text>
              
              <View className="method-selection">
                <Button 
                  className={`method-btn ${calculateType === 1 ? 'active' : ''}`}
                  onTap={() => setCalculateType(1)}
                >
                  <Text className="method-text">方式1：通过年化收益率计算最终金额</Text>
                </Button>
                
                <Button 
                  className={`method-btn ${calculateType === 2 ? 'active' : ''}`}
                  onTap={() => setCalculateType(2)}
                >
                  <Text className="method-text">方式2：通过目标金额计算年化收益率</Text>
                </Button>
              </View>
            </View>
          ) : (
            <View className="calculate-method">
              {/* 方式1：已知收益率计算最终金额 */}
              {calculateType === 1 && (
                <>
                  <Text className="section-title">方式1：已知收益率计算最终金额</Text>
                  
                  <View className="input-item">
                    <Text className="label">预期年化收益率（%）</Text>
                    <Input
                      className="input"
                      type="digit"
                      value={inputAnnualRate}
                      onInput={(e) => {
                        setInputAnnualRate(e.detail.value);
                        // 清除计算结果
                        setFinalAmount('');
                      }}
                      placeholder="请输入预期年化收益率"
                    />
                  </View>

                  <Button className="calculate-btn" onTap={() => calculateFinalAmount(years, initialAmount, monthlyInvestment, inputAnnualRate)}>
                  计算最终金额
                </Button>

                  {finalAmount && (
                    <View className="result-item">
                      <Text className="result-label">最终金额：</Text>
                      <Text className="result-value">{finalAmount} 元</Text>
                    </View>
                  )}
                </>
              )}

              {/* 方式2：已知目标金额计算收益率 */}
              {calculateType === 2 && (
                <>
                  <Text className="section-title">方式2：已知目标金额计算收益率</Text>
                  
                  <View className="input-item">
                    <Text className="label">目标金额（元）</Text>
                    <Input
                      className="input"
                      type="digit"
                      value={targetAmount}
                      onInput={(e) => {
                        setTargetAmount(e.detail.value);
                        // 清除计算结果
                        setResultAnnualRate('');
                      }}
                      placeholder="请输入目标金额"
                    />
                  </View>

                  <Button className="calculate-btn" onTap={() => calculateAnnualRate(years, initialAmount, monthlyInvestment, targetAmount)}>
                    计算年化收益率
                  </Button>

                  {resultAnnualRate && (
                    <View className="result-item">
                      <Text className="result-label">年化收益率：</Text>
                      <Text className="result-value">{resultAnnualRate} %</Text>
                    </View>
                  )}
                </>
              )}

              {/* 切换计算方式 */}
              <Button className="switch-btn" onTap={() => {
                // 切换计算方式时清除所有结果
                setCalculateType(null);
                setFinalAmount('');
                setResultAnnualRate('');
              }}>
                切换计算方式
              </Button>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default InvestmentCalculator;