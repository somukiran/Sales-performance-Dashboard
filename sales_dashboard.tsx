import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, MapPin, Calendar, Download, Brain, Filter } from 'lucide-react';

// Generate realistic sales data
const generateSalesData = () => {
  const products = ['Laptops', 'Smartphones', 'Tablets', 'Headphones', 'Cameras', 'Monitors'];
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'];
  const data = [];
  
  for (let i = 0; i < 24; i++) {
    const year = 2023 + Math.floor(i / 12);
    const month = (i % 12);
    const date = new Date(year, month, 1);
    const monthString = `${year}-${String(month + 1).padStart(2, '0')}`;
    
    products.forEach(product => {
      regions.forEach(region => {
        const baseRevenue = Math.random() * 50000 + 20000;
        const seasonality = 1 + 0.3 * Math.sin((i * Math.PI) / 6);
        const trend = 1 + (i * 0.02);
        const noise = 0.8 + Math.random() * 0.4;
        
        const revenue = baseRevenue * seasonality * trend * noise;
        const orders = Math.floor(revenue / (200 + Math.random() * 300));
        
        data.push({
          month: monthString,
          product,
          region,
          revenue: Math.round(revenue),
          orders,
          avgOrderValue: Math.round(revenue / orders),
          date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
        });
      });
    });
  }
  
  return data;
};

// AI Forecasting simulation
const generateForecast = (historicalData, months = 3) => {
  const forecast = [];
  
  if (!historicalData || historicalData.length === 0) {
    return forecast;
  }
  
  try {
    // Get the latest month from historical data
    const sortedData = historicalData.sort((a, b) => a.month.localeCompare(b.month));
    const lastMonthStr = sortedData[sortedData.length - 1]?.month;
    
    if (!lastMonthStr) return forecast;
    
    const [lastYear, lastMonth] = lastMonthStr.split('-').map(Number);
    const lastDate = new Date(lastYear, lastMonth - 1, 1);
    
    for (let i = 1; i <= months; i++) {
      const forecastDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + i, 1);
      const monthString = `${forecastDate.getFullYear()}-${String(forecastDate.getMonth() + 1).padStart(2, '0')}`;
      
      const recentData = historicalData.slice(-12);
      const avgRevenue = recentData.reduce((sum, d) => sum + (d.revenue || 0), 0) / recentData.length;
      const trend = 1 + (i * 0.03);
      const seasonality = 1 + 0.2 * Math.sin((forecastDate.getMonth() * Math.PI) / 6);
      
      forecast.push({
        month: monthString,
        revenue: Math.round(avgRevenue * trend * seasonality),
        type: 'forecast',
        confidence: Math.max(0.7 - (i * 0.1), 0.5)
      });
    }
  } catch (error) {
    console.warn('Error generating forecast:', error);
  }
  
  return forecast;
};

// AI Insights generation
const generateInsights = (data, filters) => {
  const insights = [];
  
  if (!data || data.length === 0) {
    insights.push('📊 No data available for the selected filters.');
    return insights;
  }
  
  // Top performing product
  const productPerformance = data.reduce((acc, item) => {
    acc[item.product] = (acc[item.product] || 0) + item.revenue;
    return acc;
  }, {});
  const productEntries = Object.entries(productPerformance).sort(([,a], [,b]) => b - a);
  if (productEntries.length > 0) {
    const topProduct = productEntries[0];
    insights.push(`🏆 ${topProduct[0]} is your top-performing product with ${(topProduct[1]/1000).toFixed(0)}K in revenue.`);
  }
  
  // Regional analysis
  const regionPerformance = data.reduce((acc, item) => {
    acc[item.region] = (acc[item.region] || 0) + item.revenue;
    return acc;
  }, {});
  const regionEntries = Object.entries(regionPerformance).sort(([,a], [,b]) => b - a);
  if (regionEntries.length > 0) {
    const topRegion = regionEntries[0];
    insights.push(`🌍 ${topRegion[0]} leads in regional sales with ${(topRegion[1]/1000).toFixed(0)}K revenue.`);
  }
  
  // Growth trend
  const monthlyTotals = data.reduce((acc, item) => {
    acc[item.month] = (acc[item.month] || 0) + item.revenue;
    return acc;
  }, {});
  const months = Object.keys(monthlyTotals).sort();
  if (months.length >= 3) {
    const recent = months.slice(-3).map(m => monthlyTotals[m]);
    if (recent.length === 3 && recent[0] > 0) {
      const avgGrowth = ((recent[2] - recent[0]) / recent[0]) * 100;
      insights.push(`📈 ${avgGrowth > 0 ? 'Positive' : 'Negative'} growth trend of ${Math.abs(avgGrowth).toFixed(1)}% over the last quarter.`);
    }
  }
  
  return insights;
};

const SalesAnalyticsDashboard = () => {
  const [salesData] = useState(generateSalesData());
  const [selectedProduct, setSelectedProduct] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedTimeRange, setSelectedTimeRange] = useState('All');
  const [showForecast, setShowForecast] = useState(false);
  
  const products = ['All', ...new Set(salesData.map(d => d.product))];
  const regions = ['All', ...new Set(salesData.map(d => d.region))];
  const timeRanges = ['All', 'Last 6 Months', 'Last 12 Months'];
  
  const filteredData = useMemo(() => {
    let filtered = salesData;
    
    if (selectedProduct !== 'All') {
      filtered = filtered.filter(d => d.product === selectedProduct);
    }
    
    if (selectedRegion !== 'All') {
      filtered = filtered.filter(d => d.region === selectedRegion);
    }
    
    if (selectedTimeRange !== 'All') {
      const months = selectedTimeRange === 'Last 6 Months' ? 6 : 12;
      const currentDate = new Date();
      const cutoffYear = currentDate.getFullYear();
      const cutoffMonth = currentDate.getMonth() + 1 - months;
      
      filtered = filtered.filter(d => {
        if (!d.month) return false;
        try {
          const [year, month] = d.month.split('-').map(Number);
          const itemDate = new Date(year, month - 1, 1);
          const cutoffDate = new Date(cutoffYear, cutoffMonth - 1, 1);
          return itemDate >= cutoffDate;
        } catch (error) {
          return false;
        }
      });
    }
    
    return filtered;
  }, [salesData, selectedProduct, selectedRegion, selectedTimeRange]);
  
  const kpis = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, uniqueRegions: 0 };
    }
    
    const totalRevenue = filteredData.reduce((sum, d) => sum + (d?.revenue || 0), 0);
    const totalOrders = filteredData.reduce((sum, d) => sum + (d?.orders || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const uniqueRegions = new Set(filteredData.map(d => d?.region).filter(Boolean)).size;
    
    return { totalRevenue, totalOrders, avgOrderValue, uniqueRegions };
  }, [filteredData]);
  
  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return [];
    }
    
    const monthlyData = filteredData.reduce((acc, item) => {
      if (!item?.month) return acc;
      const key = item.month;
      if (!acc[key]) {
        acc[key] = { month: key, revenue: 0, orders: 0 };
      }
      acc[key].revenue += item.revenue || 0;
      acc[key].orders += item.orders || 0;
      return acc;
    }, {});
    
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredData]);
  
  const forecast = useMemo(() => {
    if (!showForecast) return [];
    return generateForecast(chartData);
  }, [chartData, showForecast]);
  
  const productData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return [];
    }
    
    const productTotals = filteredData.reduce((acc, item) => {
      if (!item?.product) return acc;
      acc[item.product] = (acc[item.product] || 0) + (item.revenue || 0);
      return acc;
    }, {});
    
    return Object.entries(productTotals).map(([product, revenue]) => ({
      product,
      revenue: Math.round(revenue)
    })).sort((a, b) => b.revenue - a.revenue);
  }, [filteredData]);
  
  const regionData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return [];
    }
    
    const regionTotals = filteredData.reduce((acc, item) => {
      if (!item?.region) return acc;
      acc[item.region] = (acc[item.region] || 0) + (item.revenue || 0);
      return acc;
    }, {});
    
    return Object.entries(regionTotals).map(([region, revenue]) => ({
      region,
      revenue: Math.round(revenue)
    }));
  }, [filteredData]);
  
  const insights = useMemo(() => {
    return generateInsights(filteredData, { selectedProduct, selectedRegion, selectedTimeRange });
  }, [filteredData, selectedProduct, selectedRegion, selectedTimeRange]);
  
  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      filters: { product: selectedProduct, region: selectedRegion, timeRange: selectedTimeRange },
      kpis,
      insights,
      chartData,
      productData,
      regionData
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Sales Performance Dashboard</h1>
          <p className="text-slate-600">AI-powered analytics and forecasting for data-driven decisions</p>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-800">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Product</label>
              <select 
                value={selectedProduct} 
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {products.map(product => (
                  <option key={product} value={product}>{product}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Region</label>
              <select 
                value={selectedRegion} 
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Time Range</label>
              <select 
                value={selectedTimeRange} 
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {timeRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={() => setShowForecast(!showForecast)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showForecast 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                <Brain className="w-4 h-4 inline mr-2" />
                AI Forecast
              </button>
              <button
                onClick={exportReport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 inline mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
        
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-900">${(kpis.totalRevenue / 1000000).toFixed(1)}M</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Orders</p>
                <p className="text-2xl font-bold text-slate-900">{kpis.totalOrders.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-slate-900">${Math.round(kpis.avgOrderValue)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Regions</p>
                <p className="text-2xl font-bold text-slate-900">{kpis.uniqueRegions}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Revenue Trend Over Time</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={[...chartData, ...forecast]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`} />
              <Tooltip formatter={(value, name) => [`$${(value/1000).toFixed(0)}K`, name]} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={{ fill: '#2563eb' }}
                connectNulls={false}
              />
              {showForecast && (
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#ef4444' }}
                  name="Forecast"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Product and Region Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Revenue by Product</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product" angle={-45} textAnchor="end" height={80} />
                <YAxis tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`} />
                <Tooltip formatter={(value) => [`$${(value/1000).toFixed(0)}K`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Revenue by Region</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={regionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ region, percent }) => `${region} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {regionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${(value/1000).toFixed(0)}K`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* AI-Generated Insights */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-800">AI-Generated Insights</h3>
          </div>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <p className="text-slate-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalyticsDashboard;