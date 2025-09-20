"use client"

import { useState, useEffect, useCallback } from 'react'
import { useWallet } from './use-wallet'
import { CONTRACT_ADDRESSES } from '@/lib/config'
import { ethers } from 'ethers'

export interface Strategy {
  id: bigint
  strategyType: number
  status: number // 0=待激活, 1=运行中, 2=已暂停, 3=已停止
  creator: string
  initialCapital: bigint
  currentValue: bigint
  maxRisk: bigint
  createdAt: number
  lastUpdated: number
  totalTrades: number
  profitLoss: bigint
  riskLevel: number
}

export interface StrategyPerformance {
  totalReturn: bigint
  sharpeRatio: bigint
  maxDrawdown: bigint
  winRate: bigint
  profitFactor: bigint
  avgTradeDuration: number
  lastTradeTime: number
}

/**
 * 获取用户的所有策略 (模拟数据)
 */
export function useGetUserStrategies(userAddress?: string) {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const generateMockStrategies = useCallback(() => {
    if (!userAddress) return []
    
    // 生成模拟策略数据
    const mockStrategies: Strategy[] = [
      {
        id: BigInt(1),
        strategyType: 0, // 套利策略
        status: 1, // 运行中
        creator: userAddress,
        initialCapital: BigInt(Math.floor(5 * 1e18)), // 5 ETH
        currentValue: BigInt(Math.floor(5.8 * 1e18)), // 5.8 ETH
        maxRisk: BigInt(Math.floor(0.5 * 1e18)), // 0.5 ETH
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7天前
        lastUpdated: Date.now() - 2 * 60 * 60 * 1000, // 2小时前
        totalTrades: 23,
        profitLoss: BigInt(Math.floor(0.8 * 1e18)), // +0.8 ETH
        riskLevel: 1,
      },
      {
        id: BigInt(2),
        strategyType: 1, // 网格策略
        status: 1, // 运行中
        creator: userAddress,
        initialCapital: BigInt(Math.floor(3 * 1e18)), // 3 ETH
        currentValue: BigInt(Math.floor(3.2 * 1e18)), // 3.2 ETH
        maxRisk: BigInt(Math.floor(0.3 * 1e18)), // 0.3 ETH
        createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3天前
        lastUpdated: Date.now() - 30 * 60 * 1000, // 30分钟前
        totalTrades: 45,
        profitLoss: BigInt(Math.floor(0.2 * 1e18)), // +0.2 ETH
        riskLevel: 0,
      },
      {
        id: BigInt(3),
        strategyType: 2, // 定投策略
        status: 2, // 已暂停
        creator: userAddress,
        initialCapital: BigInt(Math.floor(2 * 1e18)), // 2 ETH
        currentValue: BigInt(Math.floor(1.9 * 1e18)), // 1.9 ETH
        maxRisk: BigInt(Math.floor(0.2 * 1e18)), // 0.2 ETH
        createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14天前
        lastUpdated: Date.now() - 24 * 60 * 60 * 1000, // 24小时前
        totalTrades: 12,
        profitLoss: BigInt(Math.floor(-0.1 * 1e18)), // -0.1 ETH
        riskLevel: 0,
      }
    ]
    
    return mockStrategies
  }, [userAddress])

  const refetch = useCallback(() => {
    setIsLoading(true)
    // 模拟API调用延迟
    setTimeout(() => {
      setStrategies(generateMockStrategies())
      setIsLoading(false)
    }, 1000)
  }, [generateMockStrategies])

  useEffect(() => {
    if (userAddress) {
      refetch()
    } else {
      setStrategies([])
    }
  }, [userAddress, refetch])

  return {
    strategies,
    isLoading,
    refetch
  }
}

/**
 * 获取策略详细信息
 */
export function useGetStrategyDetails(strategyId?: bigint) {
  const [strategy, setStrategy] = useState<Strategy | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (strategyId) {
      setIsLoading(true)
      // 模拟获取策略详情
      setTimeout(() => {
        // 这里应该从合约或API获取真实数据
        setStrategy(null) // 暂时返回null
        setIsLoading(false)
      }, 500)
    }
  }, [strategyId])

  return {
    strategy,
    isLoading,
  }
}

/**
 * 获取策略性能指标
 */
export function useGetStrategyPerformance(strategyId?: bigint) {
  const [performance, setPerformance] = useState<StrategyPerformance | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (strategyId) {
      setIsLoading(true)
      // 模拟获取性能数据
      setTimeout(() => {
        const mockPerformance: StrategyPerformance = {
          totalReturn: BigInt(Math.floor(0.15 * 1e18)), // 15% 回报
          sharpeRatio: BigInt(Math.floor(1.8 * 1e18)), // 1.8 夏普比率
          maxDrawdown: BigInt(Math.floor(0.05 * 1e18)), // 5% 最大回撤
          winRate: BigInt(Math.floor(0.68 * 1e18)), // 68% 胜率
          profitFactor: BigInt(Math.floor(2.1 * 1e18)), // 2.1 盈亏比
          avgTradeDuration: 4 * 60 * 60, // 4小时平均持仓时间
          lastTradeTime: Date.now() - 2 * 60 * 60 * 1000, // 2小时前
        }
        setPerformance(mockPerformance)
        setIsLoading(false)
      }, 500)
    }
  }, [strategyId])

  return {
    performance,
    isLoading,
  }
}

/**
 * 创建新策略
 */
export function useCreateStrategy() {
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | undefined>()
  const { address, isConnected } = useWallet()

  const createStrategy = useCallback(async (
    strategyType: number,
    parameters: {
      targetPrice?: bigint
      gridLevels?: number
      dcaInterval?: number
      stopLoss?: bigint
      takeProfit?: bigint
    },
    initialCapital: bigint,
    maxRisk: bigint
  ) => {
    if (!isConnected || !address) {
      throw new Error('请先连接钱包')
    }

    setIsLoading(true)
    
    try {
      // 模拟交易hash
      const mockTxHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`
      setTxHash(mockTxHash)
      
      // 模拟合约调用延迟
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('策略创建成功:', {
        strategyType,
        parameters,
        initialCapital: initialCapital.toString(),
        maxRisk: maxRisk.toString(),
        txHash: mockTxHash
      })
      
    } catch (error) {
      console.error('创建策略失败:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, address])

  return {
    createStrategy,
    isLoading,
    txHash,
  }
}

/**
 * 执行策略
 */
export function useExecuteStrategy() {
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | undefined>()

  const executeStrategy = useCallback(async (strategyId: bigint) => {
    setIsLoading(true)
    try {
      // 模拟合约调用
      const mockTxHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`
      setTxHash(mockTxHash)
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('策略执行成功:', strategyId.toString())
    } catch (error) {
      console.error('执行策略失败:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    executeStrategy,
    isLoading,
    txHash,
  }
}

/**
 * 暂停策略
 */
export function usePauseStrategy() {
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | undefined>()

  const pauseStrategy = useCallback(async (strategyId: bigint) => {
    setIsLoading(true)
    try {
      const mockTxHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`
      setTxHash(mockTxHash)
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('策略暂停成功:', strategyId.toString())
    } catch (error) {
      console.error('暂停策略失败:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    pauseStrategy,
    isLoading,
    txHash,
  }
}

/**
 * 激活策略
 */
export function useActivateStrategy() {
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | undefined>()

  const activateStrategy = useCallback(async (strategyId: bigint) => {
    setIsLoading(true)
    try {
      const mockTxHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`
      setTxHash(mockTxHash)
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('策略激活成功:', strategyId.toString())
    } catch (error) {
      console.error('激活策略失败:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    activateStrategy,
    isLoading,
    txHash,
  }
}

/**
 * 更新策略参数
 */
export function useUpdateStrategyParams() {
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | undefined>()

  const updateStrategyParams = useCallback(async (
    strategyId: bigint,
    newParams: {
      targetPrice?: bigint
      gridLevels?: number
      dcaInterval?: number
      stopLoss?: bigint
      takeProfit?: bigint
    }
  ) => {
    setIsLoading(true)
    try {
      const mockTxHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`
      setTxHash(mockTxHash)
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('策略参数更新成功:', strategyId.toString(), newParams)
    } catch (error) {
      console.error('更新策略参数失败:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    updateStrategyParams,
    isLoading,
    txHash,
  }
}

/**
 * 获取策略统计数据
 */
export function useStrategyStats(userAddress?: string) {
  const { strategies } = useGetUserStrategies(userAddress)

  const stats = {
    totalStrategies: strategies.length,
    activeStrategies: strategies.filter(s => s.status === 1).length,
    totalValue: strategies.reduce((sum, s) => sum + s.currentValue, 0n),
    totalPnL: strategies.reduce((sum, s) => sum + s.profitLoss, 0n),
    totalTrades: strategies.reduce((sum, s) => sum + s.totalTrades, 0),
    winRate: strategies.length > 0 ? 
      strategies.filter(s => s.profitLoss > 0n).length / strategies.length * 100 : 0,
    avgReturn: strategies.length > 0 ?
      Number(strategies.reduce((sum, s) => sum + s.profitLoss, 0n)) / strategies.length / 1e18 : 0,
  }

  return stats
}