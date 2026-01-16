import React, { useState, useEffect } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
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
  // 蒙层显示状态
  const [showResultModal, setShowResultModal] = useState<boolean>(false);

  // 计算最终金额（已知收益率）并生成每年金额数据
  const calculateFinalAmount = (yearsParam: string, initialAmountParam: string, monthlyInvestmentParam: string, inputAnnualRateParam: string) => {
    console.log('开始计算最终金额');
    console.log('当前参数:', { yearsParam, initialAmountParam, monthlyInvestmentParam, inputAnnualRateParam });
    
    // 转换为数字，使用默认值处理空输入
    const yearsNum = parseFloat(yearsParam) || 1;
    const initialAmountNum = parseFloat(initialAmountParam) || 0;
    const monthlyInvestmentNum = parseFloat(monthlyInvestmentParam) || 0;
    const annualRateNum = (parseFloat(inputAnnualRateParam) || 0) / 100;
    
    console.log('转换后数字:', { yearsNum, initialAmountNum, monthlyInvestmentNum, annualRateNum });
    
    // 计算最终金额
    let currentAmount = initialAmountNum;
    const annualContribution = monthlyInvestmentNum * 12;
    
    // 逐年计算
    for (let year = 1; year <= yearsNum; year++) {
      // 计算当年的投资增长
      if (annualRateNum > 0) {
        currentAmount = currentAmount * Math.pow(1 + annualRateNum, 1) + annualContribution;
      } else {
        currentAmount += annualContribution;
      }
    }
    
    // 设置最终金额
    setFinalAmount(currentAmount.toFixed(2));
    
    console.log('最终金额:', currentAmount.toFixed(2));
    
    // 显示结果蒙层
    setShowResultModal(true);
  };
  

  

  
  // 监听蒙层显示状态变化，控制页面滚动
  useEffect(() => {
    if (showResultModal) {
      // 禁止页面滚动
      Taro.pageScrollTo({ scrollTop: 0 });
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden';
      }
    } else {
      // 恢复页面滚动
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'auto';
      }
    }
  }, [showResultModal]);
  
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
    
    // 显示结果蒙层
    setShowResultModal(true);
  };
  
  // 生成投资描述文字
  const getInvestmentDescription = () => {
    if (!calculateType) return null;
    
    if (calculateType === 1) {
      // 方式1：已知收益率计算最终金额
      const yearsNum = parseFloat(years) || 1;
      const initialAmountNum = parseFloat(initialAmount) || 0;
      const monthlyInvestmentNum = parseFloat(monthlyInvestment) || 0;
      // 累计投入本金 = 初始本金 + 每月定投 * 12 * 投资年限
      const totalInvestment = initialAmountNum + monthlyInvestmentNum * 12 * yearsNum;
      
      return {
        process: `您计划投入初始本金${initialAmount}元，每月定投${monthlyInvestment}元，在年化收益率${inputAnnualRate}%的情况下，经过${years}年的复利增长`,
        result: `最终您将获得约${finalAmount}元的总投资金额，累计投入本金约${totalInvestment.toFixed(2)}元`,
        encouragement: `这就是复利的神奇力量！长期坚持定期投资，时间会成为您财富增长的最好朋友。继续保持这种投资习惯，您的财务目标一定能够实现！`
      };
    } else {
      // 方式2：已知目标金额计算年化收益率
      const yearsNum = parseFloat(years) || 1;
      const initialAmountNum = parseFloat(initialAmount) || 0;
      const monthlyInvestmentNum = parseFloat(monthlyInvestment) || 0;
      // 累计投入本金 = 初始本金 + 每月定投 * 12 * 投资年限
      const totalInvestment = initialAmountNum + monthlyInvestmentNum * 12 * yearsNum;
      
      return {
        process: `您计划投入初始本金${initialAmount}元，每月定投${monthlyInvestment}元，希望在${years}年后达到${targetAmount}元的目标金额`,
        result: `为了实现这个目标，您需要获得约${resultAnnualRate}%的年化收益率，累计投入本金约${totalInvestment.toFixed(2)}元`,
        encouragement: `虽然这个收益率目标需要一定的努力，但通过合理的资产配置和长期坚持，您完全有能力实现这个财务目标。记住：投资是一场马拉松，不是短跑！`
      };
    }
  };

  return (
    <View className="investment-calculator">
      {/* 主计算器容器 */}
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
                    <View className="result-section">
                      <View className="result-highlight">
                        <Text className="result-label">最终金额</Text>
                        <Text className="result-value-large">{finalAmount} 元</Text>
                      </View>
                      

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
                    <View className="result-section">
                      <View className="result-highlight">
                        <Text className="result-label">年化收益率</Text>
                        <Text className="result-value-large">{resultAnnualRate} %</Text>
                      </View>
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
      
      {/* 投资收益结果蒙层 */}
      {showResultModal && (
        <View className="result-modal">
          <View className="modal-content">
            {/* 关闭按钮 */}
            <View className="modal-header">
              <Text className="modal-title">投资收益分析</Text>
              <View className="close-btn" onTap={() => setShowResultModal(false)}>
                <Text className="close-text">×</Text>
              </View>
            </View>
            
            {/* 投资收益信息 */}
            <View className="modal-body">
              <View className="result-overview">
                {/* 根据计算方式显示不同的标题和结果 */}
                {calculateType === 1 ? (
                  <>
                    <Text className="overview-title">最终投资金额</Text>
                    <View className="result-value-box">
                      <Text className="result-value-big">{finalAmount} 元</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Text className="overview-title">年化收益率</Text>
                    <View className="result-value-box">
                      <Text className="result-value-big">{resultAnnualRate} %</Text>
                    </View>
                  </>
                )}
                
                {/* 详细数据 */}
                <View className="result-details">
                  <View className="detail-item">
                    <Text className="detail-label">初始本金</Text>
                    <Text className="detail-value">{initialAmount} 元</Text>
                  </View>
                  <View className="detail-item">
                    <Text className="detail-label">每月定投</Text>
                    <Text className="detail-value">{monthlyInvestment} 元</Text>
                  </View>
                  <View className="detail-item">
                    <Text className="detail-label">投资年限</Text>
                    <Text className="detail-value">{years} 年</Text>
                  </View>
                  
                  {/* 根据计算方式显示不同的第四项数据 */}
                  {calculateType === 1 ? (
                    <View className="detail-item">
                      <Text className="detail-label">年化收益率</Text>
                      <Text className="detail-value">{inputAnnualRate} %</Text>
                    </View>
                  ) : (
                    <View className="detail-item">
                      <Text className="detail-label">目标金额</Text>
                      <Text className="detail-value">{targetAmount} 元</Text>
                    </View>
                  )}
                </View>
              </View>
              
              {/* 投资描述文字 */}
              {getInvestmentDescription() && (
                <View className="description-section">
                  <View className="description-box">
                    <Text className="description-title">投资分析</Text>
                    <Text className="description-text">{getInvestmentDescription()?.process}</Text>
                    <Text className="description-text">{getInvestmentDescription()?.result}</Text>
                    <View className="encouragement-box">
                      <Text className="encouragement-text">{getInvestmentDescription()?.encouragement}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default InvestmentCalculator;