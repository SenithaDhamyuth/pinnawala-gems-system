import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { getAuctions, getSettings, type Auction } from '../services/api';
import { formatCurrency, auctionRules as defaultRules } from '../utils/auctionUtils';
import { Info, Eye, Loader2 } from 'lucide-react';

// Auction rules moved to auctionUtils.ts

const LoadingPlaceholder = () => (
  <div className="flex justify-center py-12">
    <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
  </div>
);

export function Auctions() {
  const [activeTab, setActiveTab] = useState('active');
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [rules, setRules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [auctionsData, settingsData] = await Promise.all([
          getAuctions(),
          getSettings()
        ]);
        setAuctions(auctionsData);
        setRules(settingsData.auctionRules);
      } catch (error) {
        console.error('Error fetching data:', error);
        setRules(defaultRules);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const upcomingAuctions = auctions.filter(a => a.status === 'upcoming');
  const activeAuctions = auctions.filter(a => a.status === 'active');
  const completedAuctions = auctions.filter(a => a.status === 'completed');

  const renderAuctionCard = (auction: Auction) => (
    <Card key={auction.id} className="overflow-hidden border-blue-200 shadow-md hover:shadow-xl transition-all">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 aspect-square overflow-hidden bg-gradient-to-br from-blue-100 to-blue-50">
          {(() => {
            const primaryMedia = auction.media?.find(m => m.isPinned) || auction.media?.[0];
            if (primaryMedia) {
              if (primaryMedia.type === 'video') {
                return (
                  <video
                    src={primaryMedia.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                );
              }
              return (
                <img
                  src={primaryMedia.url}
                  alt={auction.title}
                  className="w-full h-full object-cover"
                />
              );
            }
            return (
              <div className="w-full h-full flex items-center justify-center text-blue-300">
                No Media
              </div>
            );
          })()}
        </div>
        <CardContent className="p-6 md:w-2/3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={auction.status === 'active'
                ? 'bg-green-100 text-green-800 hover:bg-green-100'
                : auction.status === 'upcoming'
                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
              }>
                {auction.status.toUpperCase()}
              </Badge>
              <span className="text-xs text-gray-600">{auction.gemType}</span>
              <span className="text-xs text-gray-600">{auction.carat} Carat</span>
              <span className="text-xs text-gray-600">{auction.origin}</span>
            </div>
            <h3 className="font-bold text-xl mb-2 text-blue-900">{auction.title}</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{auction.description}</p>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600 block">
                  {auction.status === 'upcoming' ? 'Starting Bid' : 'Current Bid'}
                </span>
                <span className="font-bold text-lg text-blue-900">
                  {formatCurrency(auction.status === 'upcoming' ? auction.startingBid : auction.currentBid)}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600 block">
                  {auction.status === 'completed' ? 'Ended' : auction.status === 'upcoming' ? 'Starts' : 'Ends'}
                </span>
                <span className="text-sm font-medium">
                  {auction.status === 'completed'
                    ? new Date(auction.endDate).toLocaleDateString()
                    : auction.status === 'upcoming'
                      ? new Date(auction.startDate).toLocaleDateString()
                      : new Date(auction.endDate).toLocaleDateString()
                  }
                </span>
              </div>
            </div>

            {auction.status === 'completed' && auction.winnerName && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <span className="text-sm text-gray-600">Winner: </span>
                <span className="text-sm font-semibold text-blue-900">{auction.winnerName}</span>
              </div>
            )}

            <Link to={`/auction/${auction.id}`}>
              <Button className="w-full bg-blue-900 hover:bg-blue-800">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </Link>
          </div>
        </CardContent>
      </div>
    </Card>
  );


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Auctions</h1>
          <p className="text-gray-600">Browse and bid on rare gemstones</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-blue-900 text-blue-900 hover:bg-blue-50">
              <Info className="w-4 h-4 mr-2" />
              Auction Rules
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl text-blue-900">Auction Rules & Guidelines</DialogTitle>
              <DialogDescription className="sr-only">Detailed list of rules and guidelines for participating in auctions.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4">
                {rules.map((rule: string, index: number) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 pt-0.5">{rule}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-blue-100">
          <TabsTrigger value="active" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white">
            Active Auctions ({activeAuctions.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white">
            Upcoming Auctions ({upcomingAuctions.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white">
            Completed Auctions ({completedAuctions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {loading ? <LoadingPlaceholder /> : activeAuctions.length > 0 ? (
            activeAuctions.map(renderAuctionCard)
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No active auctions at the moment</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-6">
          {loading ? <LoadingPlaceholder /> : upcomingAuctions.length > 0 ? (
            upcomingAuctions.map(renderAuctionCard)
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No upcoming auctions scheduled</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          {loading ? <LoadingPlaceholder /> : completedAuctions.length > 0 ? (
            completedAuctions.map(renderAuctionCard)
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No completed auctions</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
