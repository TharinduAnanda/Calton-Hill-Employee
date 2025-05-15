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
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  IconButton,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Collapse,
  Badge,
  Tooltip
} from '@mui/material';
import {
  CardMembership as CardIcon, // Another good option for loyalty program
  Money as MoneyIcon,
  Settings as SettingsIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Redeem as RedeemIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Person as PersonIcon,
  Loyalty as LoyaltyIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  ExpandMore as ExpandMoreIcon,
  History as HistoryIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import marketingService from '../../services/marketingService';

const LoyaltyProgram = () => {
  const [settings, setSettings] = useState({
    program_enabled: true,
    points_per_dollar: 1,
    min_points_redemption: 100,
    points_value_factor: 0.01, // $0.01 per point
    expiry_period_days: 365,
    welcome_bonus: 100,
    birthday_bonus: 50,
    referral_bonus: 50,
    vip_tiers_enabled: true
  });
  
  const [rewards, setRewards] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [members, setMembers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  const [rewardDialog, setRewardDialog] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [rewardForm, setRewardForm] = useState({
    name: '',
    description: '',
    points_required: '',
    reward_type: 'discount',
    reward_value: '',
    active: true
  });

  const [tierDialog, setTierDialog] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [tierForm, setTierForm] = useState({
    name: '',
    points_threshold: '',
    benefits: '',
    multiplier: 1
  });

  const [expandedMember, setExpandedMember] = useState(null);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const fetchLoyaltyData = async () => {
      try {
        setLoading(true);
        const [settingsData, rewardsData, tiersData, membersData] = await Promise.all([
          marketingService.getLoyaltySettings(),
          marketingService.getLoyaltyRewards(),
          marketingService.getLoyaltyTiers(),
          marketingService.getLoyaltyMembers()
        ]);
        
        if (settingsData) {
          setSettings(settingsData);
        }
        
        setRewards(rewardsData || []);
        setTiers(tiersData || []);
        setMembers(membersData || []);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching loyalty program data:', err);
        setError('Failed to load loyalty program data');
      } finally {
        setLoading(false);
      }
    };

    fetchLoyaltyData();
  }, []);

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      await marketingService.updateLoyaltySettings(settings);
      setError(null);
    } catch (err) {
      console.error('Error saving loyalty settings:', err);
      setError('Failed to save loyalty settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Reward dialog handlers
  const handleOpenRewardDialog = (reward = null) => {
    if (reward) {
      setSelectedReward(reward);
      setRewardForm({
        name: reward.name,
        description: reward.description || '',
        points_required: reward.points_required,
        reward_type: reward.reward_type,
        reward_value: reward.reward_value,
        active: reward.active
      });
    } else {
      setSelectedReward(null);
      setRewardForm({
        name: '',
        description: '',
        points_required: '',
        reward_type: 'discount',
        reward_value: '',
        active: true
      });
    }
    
    setRewardDialog(true);
  };

  const handleCloseRewardDialog = () => {
    setRewardDialog(false);
  };

  const handleRewardFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRewardForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmitReward = async () => {
    try {
      setLoading(true);
      
      if (selectedReward) {
        await marketingService.updateLoyaltyReward(selectedReward.id, rewardForm);
        setRewards(prev => 
          prev.map(r => r.id === selectedReward.id ? { ...r, ...rewardForm } : r)
        );
      } else {
        const newReward = await marketingService.createLoyaltyReward(rewardForm);
        setRewards(prev => [...prev, newReward]);
      }
      
      setRewardDialog(false);
      setError(null);
    } catch (err) {
      console.error('Error saving reward:', err);
      setError('Failed to save reward');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReward = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reward?')) return;
    
    try {
      setLoading(true);
      await marketingService.deleteLoyaltyReward(id);
      setRewards(prev => prev.filter(r => r.id !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting reward:', err);
      setError('Failed to delete reward');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRewardStatus = async (reward) => {
    try {
      setLoading(true);
      // Create a toast notification
      const toastId = toast.loading(`${reward.active ? 'Deactivating' : 'Activating'} reward...`);
      
      const updatedReward = {
        ...reward,
        active: !reward.active
      };
      
      // Call the API to update the reward status
      const result = await marketingService.updateLoyaltyReward(reward.id, updatedReward);
      
      // Update the local state with the updated reward
      setRewards(prev => prev.map(r => r.id === reward.id ? result.data : r));
      
      // Update the toast notification
      toast.update(toastId, {
        render: `Reward ${result.data.active ? 'activated' : 'deactivated'} successfully`,
        type: "success",
        isLoading: false,
        autoClose: 3000
      });
    } catch (err) {
      console.error('Error toggling reward status:', err);
      toast.error(`Failed to update reward status: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Tier dialog handlers
  const handleOpenTierDialog = (tier = null) => {
    if (tier) {
      setSelectedTier(tier);
      setTierForm({
        name: tier.name,
        points_threshold: tier.points_threshold,
        benefits: tier.benefits || '',
        multiplier: tier.multiplier || 1
      });
    } else {
      setSelectedTier(null);
      setTierForm({
        name: '',
        points_threshold: '',
        benefits: '',
        multiplier: 1
      });
    }
    
    setTierDialog(true);
  };

  const handleCloseTierDialog = () => {
    setTierDialog(false);
  };

  const handleTierFormChange = (e) => {
    const { name, value } = e.target;
    setTierForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitTier = async () => {
    try {
      setLoading(true);
      
      if (selectedTier) {
        await marketingService.updateLoyaltyTier(selectedTier.id, tierForm);
        setTiers(prev => 
          prev.map(t => t.id === selectedTier.id ? { ...t, ...tierForm } : t)
        );
      } else {
        const newTier = await marketingService.createLoyaltyTier(tierForm);
        setTiers(prev => [...prev, newTier]);
      }
      
      setTierDialog(false);
      setError(null);
    } catch (err) {
      console.error('Error saving tier:', err);
      setError('Failed to save tier');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTier = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tier?')) return;
    
    try {
      setLoading(true);
      await marketingService.deleteLoyaltyTier(id);
      setTiers(prev => prev.filter(t => t.id !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting tier:', err);
      setError('Failed to delete tier');
    } finally {
      setLoading(false);
    }
  };

  // Determine tier for a given points value
  const getTierForPoints = (points) => {
    if (!tiers.length) return null;
    
    // Sort tiers by threshold in descending order
    const sortedTiers = [...tiers].sort((a, b) => b.points_threshold - a.points_threshold);
    
    // Find the first tier where points >= threshold
    return sortedTiers.find(tier => points >= tier.points_threshold) || null;
  };

  const handleViewHistory = async (memberId) => {
    if (expandedMember === memberId) {
      setExpandedMember(null);
      return;
    }
    
    try {
      setLoadingHistory(true);
      setExpandedMember(memberId);
      
      // Fetch real data from API
      const response = await marketingService.getMemberPointsHistory(memberId);
      setPointsHistory(response.data || []);
    } catch (err) {
      console.error('Error fetching points history:', err);
      setError('Failed to load points history');
      setPointsHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* New Stats Banner with previously unused components */}
      <Paper sx={{ mb: 3, p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center">
              {/* <Badge
                badgeContent="NEW" 
                color="secondary"
                sx={{ mr: 2 }}
              >
                <CardIcon sx={{ fontSize: 40 }} />
              </Badge> */}
              <Box>
                <Typography variant="h6">Loyalty Program</Typography>
                <Typography variant="body2">Reward your frequent customers</Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center">
              <MoneyIcon sx={{ fontSize: 24, mr: 1 }} />
              <Typography variant="body1">
                Point Value: ${settings.points_value_factor} per point
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                <StarBorderIcon sx={{ fontSize: 20, color: 'warning.main' }} />
                <ExpandMoreIcon sx={{ fontSize: 16 }} />
                <StarIcon sx={{ fontSize: 24, color: 'warning.main' }} />
              </Box>
              <Typography variant="body1">
                {tiers.length} Active Tier{tiers.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {loading && !settings ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab icon={<SettingsIcon />} label="PROGRAM SETTINGS" />
              <Tab icon={<RedeemIcon />} label="REWARDS" />
              <Tab icon={<StarIcon />} label="TIERS" />
              <Tab icon={<PersonIcon />} label="MEMBERS" />
            </Tabs>
            
            <Box p={3}>
              {/* Program Settings Tab */}
              {activeTab === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card>
                      <CardHeader title="Loyalty Program Settings" />
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={settings.program_enabled}
                                  onChange={handleSettingsChange}
                                  name="program_enabled"
                                  color="primary"
                                />
                              }
                              label="Enable Loyalty Program"
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Points Per Dollar Spent"
                              name="points_per_dollar"
                              value={settings.points_per_dollar}
                              onChange={handleSettingsChange}
                              type="number"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LoyaltyIcon fontSize="small" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Point Value in Dollars"
                              name="points_value_factor"
                              value={settings.points_value_factor}
                              onChange={handleSettingsChange}
                              type="number"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">$</InputAdornment>
                                ),
                              }}
                              helperText={`100 points = $${(settings.points_value_factor * 100).toFixed(2)}`}
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Minimum Points for Redemption"
                              name="min_points_redemption"
                              value={settings.min_points_redemption}
                              onChange={handleSettingsChange}
                              type="number"
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Points Expiry (days)"
                              name="expiry_period_days"
                              value={settings.expiry_period_days}
                              onChange={handleSettingsChange}
                              type="number"
                              helperText="0 = Never expire"
                            />
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>Bonus Points</Typography>
                          </Grid>
                          
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="Welcome Bonus"
                              name="welcome_bonus"
                              value={settings.welcome_bonus}
                              onChange={handleSettingsChange}
                              type="number"
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="Birthday Bonus"
                              name="birthday_bonus"
                              value={settings.birthday_bonus}
                              onChange={handleSettingsChange}
                              type="number"
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="Referral Bonus"
                              name="referral_bonus"
                              value={settings.referral_bonus}
                              onChange={handleSettingsChange}
                              type="number"
                            />
                          </Grid>
                          
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={settings.vip_tiers_enabled}
                                  onChange={handleSettingsChange}
                                  name="vip_tiers_enabled"
                                  color="primary"
                                />
                              }
                              label="Enable VIP Tiers"
                            />
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Button
                              variant="contained"
                              onClick={saveSettings}
                              disabled={loading}
                            >
                              {loading ? <CircularProgress size={24} /> : 'Save Settings'}
                            </Button>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
              
              {/* Rewards Tab */}
              {activeTab === 1 && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">Loyalty Rewards</Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenRewardDialog()}
                    >
                      Add Reward
                    </Button>
                  </Box>
                  
                  <Grid container spacing={3}>
                    {rewards.length === 0 ? (
                      <Grid item xs={12}>
                        <Card>
                          <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <RedeemIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>No Rewards Yet</Typography>
                            <Typography variant="body2" color="textSecondary" paragraph>
                              Create rewards that members can redeem with their loyalty points.
                            </Typography>
                            <Button
                              variant="contained"
                              startIcon={<AddIcon />}
                              onClick={() => handleOpenRewardDialog()}
                            >
                              Add First Reward
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    ) : (
                      rewards.map(reward => (
                        <Grid item key={reward.id} xs={12} sm={6} md={4}>
                          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardHeader
                              title={reward.name}
                              subheader={`${reward.points_required} points`}
                              action={
                                <Box>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenRewardDialog(reward)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteReward(reward.id)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              }
                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                              {reward.description && (
                                <Typography variant="body2" color="textSecondary" paragraph>
                                  {reward.description}
                                </Typography>
                              )}
                              
                              <Box mt={2}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Reward Value:
                                </Typography>
                                <Typography variant="body1">
                                  {reward.reward_type === 'discount' && `${reward.reward_value}% Discount`}
                                  {reward.reward_type === 'fixed' && `$${parseFloat(reward.reward_value).toFixed(2)} Off`}
                                  {reward.reward_type === 'product' && `Free Product: ${reward.reward_value}`}
                                  {reward.reward_type === 'shipping' && 'Free Shipping'}
                                </Typography>
                              </Box>
                            </CardContent>
                            <Divider />
                            <Box p={1} display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" color={reward.active ? 'success.main' : 'error.main'}>
                                {reward.active ? 'Active' : 'Inactive'}
                              </Typography>
                              <Tooltip title={reward.active ? "Deactivate reward" : "Activate reward"}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleRewardStatus(reward)}
                                  color={reward.active ? "primary" : "default"}
                                >
                                  {reward.active ? <ToggleOnIcon /> : <ToggleOffIcon />}
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Card>
                        </Grid>
                      ))
                    )}
                  </Grid>
                </Box>
              )}

              {/* Tiers Tab */}
              {activeTab === 2 && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">VIP Tier Levels</Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenTierDialog()}
                      disabled={!settings.vip_tiers_enabled}
                    >
                      Add Tier
                    </Button>
                  </Box>
                  
                  {!settings.vip_tiers_enabled ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      VIP Tiers are currently disabled. Enable them in Program Settings.
                    </Alert>
                  ) : null}
                  
                  <Grid container spacing={3}>
                    {tiers.length === 0 ? (
                      <Grid item xs={12}>
                        <Card>
                          <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <StarIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>No Tiers Yet</Typography>
                            <Typography variant="body2" color="textSecondary" paragraph>
                              Create VIP tiers to reward your most loyal customers with special benefits.
                            </Typography>
                            <Button
                              variant="contained"
                              startIcon={<AddIcon />}
                              onClick={() => handleOpenTierDialog()}
                              disabled={!settings.vip_tiers_enabled}
                            >
                              Add First Tier
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    ) : (
                      tiers
                        .sort((a, b) => a.points_threshold - b.points_threshold)
                        .map(tier => (
                          <Grid item key={tier.id} xs={12} sm={6} md={4}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                              <CardHeader
                                title={tier.name}
                                subheader={`${tier.points_threshold}+ points`}
                                avatar={
                                  <Box sx={{ color: 'warning.main' }}>
                                    {[...Array(Math.min(tier.multiplier, 5))].map((_, i) => (
                                      <StarIcon key={i} fontSize="small" />
                                    ))}
                                  </Box>
                                }
                                action={
                                  <Box>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleOpenTierDialog(tier)}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleDeleteTier(tier.id)}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                }
                              />
                              <CardContent sx={{ flexGrow: 1 }}>
                                {tier.benefits && (
                                  <>
                                    <Typography variant="subtitle2" gutterBottom>
                                      Tier Benefits:
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                      {tier.benefits}
                                    </Typography>
                                  </>
                                )}
                                
                                <Box mt={2}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Points Multiplier:
                                  </Typography>
                                  <Typography variant="body1">
                                    {tier.multiplier}x points on purchases
                                  </Typography>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))
                    )}
                  </Grid>
                </Box>
              )}

              {/* Members Tab */}
              {activeTab === 3 && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">Loyalty Program Members</Typography>
                    <TextField 
                      placeholder="Search members..."
                      size="small"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Member</TableCell>
                          <TableCell align="right">Points</TableCell>
                          <TableCell>Tier</TableCell>
                          <TableCell>Since</TableCell>
                          <TableCell align="right">Total Spent</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {members.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              <Box py={3}>
                                <Typography variant="body1" color="textSecondary">
                                  No loyalty program members yet.
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ) : (
                          members.map(member => {
                            const memberTier = getTierForPoints(member.points);
                            return (
                              <React.Fragment key={member.id}>
                                <TableRow hover>
                                  <TableCell>
                                    <Box display="flex" alignItems="center">
                                      <Avatar 
                                        src={member.avatar} 
                                        alt={member.name}
                                        sx={{ mr: 2, width: 40, height: 40 }}
                                      >
                                        {member.name.charAt(0)}
                                      </Avatar>
                                      <Box>
                                        <Typography variant="body1">{member.name}</Typography>
                                        <Typography variant="body2" color="textSecondary">
                                          {member.email}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography variant="body1">{member.points}</Typography>
                                  </TableCell>
                                  <TableCell>
                                    {memberTier ? (
                                      <Box display="flex" alignItems="center">
                                        {[...Array(Math.min(memberTier.multiplier, 3))].map((_, i) => (
                                          <StarIcon key={i} fontSize="small" color="warning" />
                                        ))}
                                        <Typography variant="body2" sx={{ ml: 1 }}>
                                          {memberTier.name}
                                        </Typography>
                                      </Box>
                                    ) : (
                                      <Typography variant="body2">Standard</Typography>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {format(new Date(member.joined_date), 'MMM dd, yyyy')}
                                  </TableCell>
                                  <TableCell align="right">
                                    ${member.total_spent.toFixed(2)}
                                  </TableCell>
                                  <TableCell align="right">
                                    <Button
                                      size="small"
                                      startIcon={<HistoryIcon />}
                                      onClick={() => handleViewHistory(member.id)}
                                      color={expandedMember === member.id ? "primary" : "inherit"}
                                    >
                                      History
                                    </Button>
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell colSpan={6} sx={{ py: 0 }}>
                                    <Collapse in={expandedMember === member.id} timeout="auto" unmountOnExit>
                                      <Box p={3}>
                                        <Typography variant="h6" gutterBottom>
                                          Points History
                                        </Typography>
                                        {loadingHistory ? (
                                          <Box display="flex" justifyContent="center" my={2}>
                                            <CircularProgress size={24} />
                                          </Box>
                                        ) : pointsHistory.length > 0 ? (
                                          <TableContainer component={Paper} variant="outlined">
                                            <Table size="small">
                                              <TableHead>
                                                <TableRow>
                                                  <TableCell>Date</TableCell>
                                                  <TableCell>Type</TableCell>
                                                  <TableCell>Points</TableCell>
                                                  <TableCell>Source</TableCell>
                                                  <TableCell>Description</TableCell>
                                                </TableRow>
                                              </TableHead>
                                              <TableBody>
                                                {pointsHistory.map((transaction) => (
                                                  <TableRow key={transaction.id}>
                                                    <TableCell>
                                                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                                                    </TableCell>
                                                    <TableCell>
                                                      {transaction.transaction_type === 'earn' ? (
                                                        <Typography color="success.main">Earned</Typography>
                                                      ) : (
                                                        <Typography color="error.main">Redeemed</Typography>
                                                      )}
                                                    </TableCell>
                                                    <TableCell>
                                                      <Typography color={transaction.transaction_type === 'earn' ? 'success.main' : 'error.main'}>
                                                        {transaction.transaction_type === 'earn' ? '+' : '-'}
                                                        {transaction.points}
                                                      </Typography>
                                                    </TableCell>
                                                    <TableCell>{transaction.source}</TableCell>
                                                    <TableCell>{transaction.description}</TableCell>
                                                  </TableRow>
                                                ))}
                                              </TableBody>
                                            </Table>
                                          </TableContainer>
                                        ) : (
                                          <Alert severity="info">No point transactions found for this member.</Alert>
                                        )}
                                      </Box>
                                    </Collapse>
                                  </TableCell>
                                </TableRow>
                              </React.Fragment>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Reward Dialog */}
          <Dialog open={rewardDialog} onClose={handleCloseRewardDialog} maxWidth="sm" fullWidth>
            <DialogTitle>
              {selectedReward ? 'Edit Reward' : 'Add New Reward'}
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Reward Name"
                    name="name"
                    value={rewardForm.name}
                    onChange={handleRewardFormChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    name="description"
                    value={rewardForm.description}
                    onChange={handleRewardFormChange}
                    fullWidth
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Points Required"
                    name="points_required"
                    value={rewardForm.points_required}
                    onChange={handleRewardFormChange}
                    type="number"
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Reward Type</InputLabel>
                    <Select
                      name="reward_type"
                      value={rewardForm.reward_type}
                      onChange={handleRewardFormChange}
                      label="Reward Type"
                    >
                      <MenuItem value="discount">Percentage Discount</MenuItem>
                      <MenuItem value="fixed">Fixed Amount Discount</MenuItem>
                      <MenuItem value="product">Free Product</MenuItem>
                      <MenuItem value="shipping">Free Shipping</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {rewardForm.reward_type !== 'shipping' && (
                  <Grid item xs={12}>
                    <TextField
                      label={
                        rewardForm.reward_type === 'discount' ? 'Discount Percentage' :
                        rewardForm.reward_type === 'fixed' ? 'Discount Amount' : 
                        'Product Name'
                      }
                      name="reward_value"
                      value={rewardForm.reward_value}
                      onChange={handleRewardFormChange}
                      type={rewardForm.reward_type === 'product' ? 'text' : 'number'}
                      fullWidth
                      required
                      InputProps={rewardForm.reward_type === 'discount' ? {
                        endAdornment: <InputAdornment position="end">%</InputAdornment>
                      } : rewardForm.reward_type === 'fixed' ? {
                        startAdornment: <InputAdornment position="start">$</InputAdornment>
                      } : undefined}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={rewardForm.active}
                        onChange={handleRewardFormChange}
                        name="active"
                      />
                    }
                    label="Active"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseRewardDialog}>Cancel</Button>
              <Button 
                variant="contained" 
                onClick={handleSubmitReward} 
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Save'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Tier Dialog */}
          <Dialog open={tierDialog} onClose={handleCloseTierDialog} maxWidth="sm" fullWidth>
            <DialogTitle>
              {selectedTier ? 'Edit Tier' : 'Add New Tier'}
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Tier Name"
                    name="name"
                    value={tierForm.name}
                    onChange={handleTierFormChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Points Threshold"
                    name="points_threshold"
                    value={tierForm.points_threshold}
                    onChange={handleTierFormChange}
                    type="number"
                    fullWidth
                    required
                    helperText="Minimum points needed to reach this tier"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Points Multiplier"
                    name="multiplier"
                    value={tierForm.multiplier}
                    onChange={handleTierFormChange}
                    type="number"
                    inputProps={{ min: 1, step: 0.1 }}
                    fullWidth
                    required
                    helperText="Points earned per dollar (e.g. 2 = 2x points)"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Benefits"
                    name="benefits"
                    value={tierForm.benefits}
                    onChange={handleTierFormChange}
                    fullWidth
                    multiline
                    rows={3}
                    helperText="List the benefits for this tier (free shipping, exclusive discounts, etc.)"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseTierDialog}>Cancel</Button>
              <Button 
                variant="contained" 
                onClick={handleSubmitTier} 
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Save'}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default LoyaltyProgram;