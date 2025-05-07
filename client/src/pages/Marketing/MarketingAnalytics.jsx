import React, { useState, useEffect } from 'react';
import {
  Box, 
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  FunnelChart,
  Funnel,
  FunnelItem,
  LabelList
} from 'recharts';
import { format, subDays, subMonths } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import marketingService from '../../services/marketingService';

const MarketingAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    campaignPerformance: [],
    channelEffectiveness: [],
    customerEngagement: [],
    loyaltyMetrics: {},
    conversionFunnels: []
  });
  const [dateRange, setDateRange] = useState({
    startDate: subMonths(new Date(), 3),
    endDate: new Date()
  });
  const [activeTab, setActiveTab] = useState(0);
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [selectedCampaign, setSelectedCampaign] = useState('all');

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, selectedCampaign]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const formattedStartDate = format(dateRange.startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(dateRange.endDate, 'yyyy-MM-dd');
      
      const response = await marketingService.getMarketingAnalytics({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        campaign: selectedCampaign
      });
      
      setAnalyticsData(response);
      setError(null);
    } catch (err) {
      console.error('Error fetching marketing analytics:', err);
      setError('Failed to load marketing analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMetricChange = (event) => {
    setSelectedMetric(event.target.value);
  };

  const handleCampaignChange = (event) => {
    setSelectedCampaign(event.target.value);
  };

  const handleStartDateChange = (newDate) => {
    setDateRange(prev => ({ ...prev, startDate: newDate }));
  };

  const handleEndDateChange = (newDate) => {
    setDateRange(prev => ({ ...prev, endDate: newDate }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  // Campaign Performance Tab
  const renderCampaignPerformance = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Campaign Performance" 
              action={
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Metric</InputLabel>
                  <Select
                    value={selectedMetric}
                    label="Metric"
                    onChange={handleMetricChange}
                  >
                    <MenuItem value="revenue">Revenue</MenuItem>
                    <MenuItem value="roi">ROI</MenuItem>
                    <MenuItem value="conversions">Conversions</MenuItem>
                    <MenuItem value="clicks">Clicks</MenuItem>
                  </Select>
                </FormControl>
              }
            />
            <Divider />
            <CardContent>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData.campaignPerformance}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => 
                        selectedMetric === 'revenue' ? 
                          formatCurrency(value) : 
                        selectedMetric === 'roi' ? 
                          formatPercentage(value) : 
                          value
                      }
                    />
                    <Legend />
                    <Bar 
                      dataKey={selectedMetric} 
                      fill="#8884d8"
                      name={
                        selectedMetric === 'revenue' ? 'Revenue' :
                        selectedMetric === 'roi' ? 'ROI (%)' :
                        selectedMetric === 'conversions' ? 'Conversions' :
                        'Clicks'
                      }
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Campaign</TableCell>
                  <TableCell align="right">Clicks</TableCell>
                  <TableCell align="right">Conversions</TableCell>
                  <TableCell align="right">Conv. Rate</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                  <TableCell align="right">Cost</TableCell>
                  <TableCell align="right">ROI</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analyticsData.campaignPerformance.map((campaign) => (
                  <TableRow key={campaign.name}>
                    <TableCell>{campaign.name}</TableCell>
                    <TableCell align="right">{campaign.clicks.toLocaleString()}</TableCell>
                    <TableCell align="right">{campaign.conversions.toLocaleString()}</TableCell>
                    <TableCell align="right">
                      {(campaign.conversions / campaign.clicks * 100).toFixed(2)}%
                    </TableCell>
                    <TableCell align="right">{formatCurrency(campaign.revenue)}</TableCell>
                    <TableCell align="right">{formatCurrency(campaign.cost)}</TableCell>
                    <TableCell align="right">{formatPercentage(campaign.roi)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    );
  };

  // Channel Effectiveness Tab
  const renderChannelEffectiveness = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Channel Conversion Rates" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData.channelEffectiveness}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 25]} />
                    <YAxis dataKey="channel" type="category" width={100} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Bar 
                      dataKey="conversionRate" 
                      fill="#82ca9d" 
                      name="Conversion Rate (%)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Channel Traffic Distribution" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.channelEffectiveness}
                      nameKey="channel"
                      dataKey="visitors"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analyticsData.channelEffectiveness.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Channel</TableCell>
                  <TableCell align="right">Visitors</TableCell>
                  <TableCell align="right">Conversions</TableCell>
                  <TableCell align="right">Conversion Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analyticsData.channelEffectiveness.map((channel) => (
                  <TableRow key={channel.channel}>
                    <TableCell>{channel.channel}</TableCell>
                    <TableCell align="right">{channel.visitors.toLocaleString()}</TableCell>
                    <TableCell align="right">{channel.conversions.toLocaleString()}</TableCell>
                    <TableCell align="right">{channel.conversionRate.toFixed(2)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    );
  };

  // Customer Engagement Tab
  const renderCustomerEngagement = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Customer Engagement Trends" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analyticsData.customerEngagement}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(dateStr) => format(new Date(dateStr), 'MMM d')}
                    />
                    <YAxis />
                    <Tooltip labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy')} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="websiteVisits" 
                      stroke="#8884d8" 
                      name="Website Visits"
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="socialInteractions" 
                      stroke="#82ca9d" 
                      name="Social Interactions" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="emailOpens" 
                      stroke="#ffc658" 
                      name="Email Opens" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Email Campaign Performance" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={analyticsData.emailCampaigns || []}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="openRate" 
                      name="Open Rate (%)" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="clickRate" 
                      name="Click Rate (%)" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Social Media Engagement" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData.socialEngagement || []}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="likes" name="Likes" fill="#8884d8" />
                    <Bar dataKey="shares" name="Shares" fill="#82ca9d" />
                    <Bar dataKey="comments" name="Comments" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Loyalty Analytics Tab
  const renderLoyaltyAnalytics = () => {
    const { loyaltyMetrics } = analyticsData;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Loyalty Program Overview" />
            <Divider />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">Total Members</Typography>
                <Typography variant="h4">{loyaltyMetrics.totalMembers}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {loyaltyMetrics.activeMembers} active members ({(loyaltyMetrics.activeMembers / loyaltyMetrics.totalMembers * 100).toFixed(1)}%)
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">Points Issued</Typography>
                <Typography variant="h5">{loyaltyMetrics.pointsIssued.toLocaleString()}</Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">Points Redeemed</Typography>
                <Typography variant="h5">{loyaltyMetrics.pointsRedeemed.toLocaleString()}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Redemption Rate: {loyaltyMetrics.redemptionRate.toFixed(1)}%
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="textSecondary">Member Retention Rate</Typography>
                <Typography variant="h5">{loyaltyMetrics.memberRetention.toFixed(1)}%</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Loyalty Member vs. Non-Member Sales" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Member Sales', value: loyaltyMetrics.memberSales },
                        { name: 'Non-Member Sales', value: loyaltyMetrics.nonMemberSales }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                    >
                      <Cell fill="#8884d8" />
                      <Cell fill="#82ca9d" />
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1">
                  Total Member Sales: {formatCurrency(loyaltyMetrics.memberSales)}
                </Typography>
                <Typography variant="body1">
                  Total Non-Member Sales: {formatCurrency(loyaltyMetrics.nonMemberSales)}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 1 }}>
                  Average Order Value:
                </Typography>
                <Typography variant="body1">
                  Members: {formatCurrency(loyaltyMetrics.memberAOV || 0)}
                </Typography>
                <Typography variant="body1">
                  Non-Members: {formatCurrency(loyaltyMetrics.nonMemberAOV || 0)}
                </Typography>
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                  Members spend {(loyaltyMetrics.memberAOV / loyaltyMetrics.nonMemberAOV * 100 - 100).toFixed(1)}% more per order
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Points Activity Over Time" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analyticsData.pointsActivity || []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(dateStr) => format(new Date(dateStr), 'MMM yyyy')}
                    />
                    <YAxis />
                    <Tooltip labelFormatter={(label) => format(new Date(label), 'MMMM yyyy')} />
                    <Legend />
                    <Line type="monotone" dataKey="issued" name="Points Issued" stroke="#8884d8" />
                    <Line type="monotone" dataKey="redeemed" name="Points Redeemed" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Conversion Funnel Tab
  const renderConversionFunnel = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Customer Conversion Funnel" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 500 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <FunnelChart>
                    <Tooltip />
                    <Funnel
                      dataKey="count"
                      data={analyticsData.conversionFunnels}
                      isAnimationActive
                    >
                      <LabelList position="right" fill="#000" stroke="none" dataKey="stage" />
                      {analyticsData.conversionFunnels.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Funnel Stage</TableCell>
                  <TableCell align="right">Count</TableCell>
                  <TableCell align="right">Conversion Rate from Previous</TableCell>
                  <TableCell align="right">Overall Conversion Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analyticsData.conversionFunnels.map((stage, index, array) => (
                  <TableRow key={stage.stage}>
                    <TableCell>{stage.stage}</TableCell>
                    <TableCell align="right">{stage.count.toLocaleString()}</TableCell>
                    <TableCell align="right">
                      {index === 0 ? 'N/A' : 
                        `${(stage.count / array[index - 1].count * 100).toFixed(2)}%`}
                    </TableCell>
                    <TableCell align="right">
                      {index === 0 ? '100%' : 
                        `${(stage.count / array[0].count * 100).toFixed(2)}%`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Marketing Analytics</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={dateRange.startDate}
                onChange={handleStartDateChange}
                renderInput={(params) => 
                  <TextField {...params} size="small" sx={{ width: 150 }} />
                }
              />
              <DatePicker
                label="End Date"
                value={dateRange.endDate}
                onChange={handleEndDateChange}
                renderInput={(params) => 
                  <TextField {...params} size="small" sx={{ width: 150 }} />
                }
              />
            </LocalizationProvider>
            <Button variant="contained" onClick={fetchAnalyticsData}>
              Apply
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Campaign Performance" />
          <Tab label="Channel Effectiveness" />
          <Tab label="Customer Engagement" />
          <Tab label="Loyalty Analytics" />
          <Tab label="Conversion Funnel" />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {activeTab === 0 && renderCampaignPerformance()}
              {activeTab === 1 && renderChannelEffectiveness()}
              {activeTab === 2 && renderCustomerEngagement()}
              {activeTab === 3 && renderLoyaltyAnalytics()}
              {activeTab === 4 && renderConversionFunnel()}
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default MarketingAnalytics;