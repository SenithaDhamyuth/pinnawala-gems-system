import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  getAuctions,
  deleteAuction as apiDeleteAuction,
  getSettings,
  updateSettings,
  type Auction
} from '../services/api';
import { formatCurrency, auctionRules as defaultRules } from '../utils/auctionUtils';
import {
  Plus, Pencil, Trash2, Eye, TrendingUp,
  Gavel, Calendar, Info, AlertTriangle, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

// Default rules fallback

export function AdminDashboard() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [auctionToDelete, setAuctionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [rules, setRules] = useState<string[]>([]);
  const [isUpdatingRules, setIsUpdatingRules] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [auctionsData, settingsData] = await Promise.all([
        getAuctions(),
        getSettings()
      ]);
      setAuctions(auctionsData);
      setRules(settingsData.auctionRules);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
      setRules(defaultRules); // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const upcomingAuctions = auctions.filter(a => a.status === 'upcoming');
  const activeAuctions = auctions.filter(a => a.status === 'active');
  const completedAuctions = auctions.filter(a => a.status === 'completed');

  const handleDeleteAuction = (id: string) => {
    setAuctionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (auctionToDelete) {
      setIsDeleting(true);
      try {
        await apiDeleteAuction(auctionToDelete);
        setAuctions(auctions.filter(a => a.id !== auctionToDelete));
        toast.success('Auction deleted successfully');
        setDeleteDialogOpen(false);
        setAuctionToDelete(null);
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete auction');
      } finally {
        setIsDeleting(false);
      }
    }
  };
  const handleUpdateRules = async () => {
    setIsUpdatingRules(true);
    try {
      await updateSettings({ auctionRules: rules });
      toast.success('Auction rules updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update rules');
    } finally {
      setIsUpdatingRules(false);
    }
  };

  const handleAddRule = () => {
    setRules([...rules, '']);
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_: string, i: number) => i !== index));
  };

  const handleRuleChange = (index: number, value: string) => {
    const newRules = [...rules];
    newRules[index] = value;
    setRules(newRules);
  };

  const renderAuctionCard = (auction: Auction, canEdit: boolean) => (
    <Card key={auction.id} className="border-blue-200 shadow-md">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="w-32 h-32 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-blue-50 flex-shrink-0">
            {(() => {
              const coverMedia = auction.media?.find((m: any) => m.isPinned) || auction.media?.[0];
              if (!coverMedia) return null;
              if (coverMedia.type === 'image') {
                return (
                  <img
                    src={coverMedia.url}
                    alt={auction.title}
                    className="w-full h-full object-cover"
                  />
                );
              } else {
                return (
                  <video
                    src={coverMedia.url}
                    className="w-full h-full object-cover"
                  />
                );
              }
            })()}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${auction.status === 'active'
                    ? 'bg-green-500'
                    : auction.status === 'upcoming'
                      ? 'bg-blue-500'
                      : 'bg-gray-500'
                    }`}>
                    {auction.status.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-gray-600">{auction.gemType} • {auction.carat} ct</span>
                </div>
                <h3 className="font-bold text-lg text-blue-900 mb-1">{auction.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{auction.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 mb-4">
              <div>
                <p className="text-xs text-gray-600">Starting Bid</p>
                <p className="font-semibold text-blue-900">{formatCurrency(auction.startingBid)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Current Bid</p>
                <p className="font-semibold text-green-700">{formatCurrency(auction.currentBid)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Start Date</p>
                <p className="text-sm">{new Date(auction.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">End Date</p>
                <p className="text-sm">{new Date(auction.endDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Link to={`/auction/${auction.id}`}>
                <Button size="sm" variant="outline" className="border-blue-900 text-blue-900">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
              </Link>
              {canEdit ? (
                <>
                  <Link to={`/admin/edit-auction/${auction.id}`}>
                    <Button size="sm" variant="outline" className="border-blue-900 text-blue-900">
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteAuction(auction.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </>
              ) : (
                <div className="text-sm text-gray-600 italic flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Cannot edit active/completed auctions
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-900 mb-4" />
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-blue-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage auctions and view bidding activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="border-blue-200 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Auctions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{auctions.length}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 shadow-md bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Active Auctions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{activeAuctions.length}</div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 shadow-md bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Upcoming Auctions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{upcomingAuctions.length}</div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-md bg-gray-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Completed Auctions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-700">{completedAuctions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-8">
        <Link to="/admin/create-auction">
          <Button className="bg-blue-900 hover:bg-blue-800">
            <Plus className="w-4 h-4 mr-2" />
            Create New Auction
          </Button>
        </Link>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-blue-900 text-blue-900 hover:bg-blue-50">
              <Pencil className="w-4 h-4 mr-2" />
              Edit Auction Rules
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[85vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl text-blue-900">Edit Auction Rules & Guidelines</DialogTitle>
              <DialogDescription className="sr-only">Form to edit the rules and guidelines for auctions.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4 my-4">
              <div className="space-y-4">
                {rules.map((rule: string, index: number) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center text-sm font-bold mt-1">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <Input
                        value={rule}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRuleChange(index, e.target.value)}
                        placeholder={`Rule ${index + 1}`}
                        className="border-blue-200"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-1"
                      onClick={() => handleRemoveRule(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={handleAddRule}
                  className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Rule
                </Button>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button
                onClick={handleUpdateRules}
                className="bg-blue-900 hover:bg-blue-800"
                disabled={isUpdatingRules}
              >
                {isUpdatingRules ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TrendingUp className="w-4 h-4 mr-2" />}
                Save Rules
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Auctions Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-blue-100">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white">
            <Calendar className="w-4 h-4 mr-2" />
            Upcoming ({upcomingAuctions.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white">
            <Gavel className="w-4 h-4 mr-2" />
            Active ({activeAuctions.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white">
            <TrendingUp className="w-4 h-4 mr-2" />
            Completed ({completedAuctions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAuctions.length > 0 ? (
            upcomingAuctions.map(auction => renderAuctionCard(auction, true))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-blue-200">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No upcoming auctions</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeAuctions.length > 0 ? (
            activeAuctions.map(auction => renderAuctionCard(auction, false))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-blue-200">
              <Gavel className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No active auctions</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedAuctions.length > 0 ? (
            completedAuctions.map(auction => renderAuctionCard(auction, false))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-blue-200">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No completed auctions</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-gray-700">
            Are you sure you want to delete this auction? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
