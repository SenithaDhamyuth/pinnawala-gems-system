import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import {
  getAuction,
  getBids,
  placeBid as apiPlaceBid,
  getSettings,
  getTieBids,
  type Auction,
  type Bid
} from '../services/api';
import { formatCurrency, formatDate, getTimeRemaining, auctionRules as defaultRules } from '../utils/auctionUtils';
import {
  ArrowLeft, Clock, Gavel, Phone, FileText, Award,
  MapPin, Calendar, TrendingUp, AlertCircle, Loader2, Video, Maximize2, X, ChevronLeft, ChevronRight, Users
} from 'lucide-react';
import { toast } from 'sonner';

// Auction rules moved to auctionUtils.ts

// Mock current user for demo purposes (matching the frontend's original logic)
const mockCurrentUser = {
  id: 'user-current',
  name: 'Jerad Xavier',
  isVerified: true
};

export function AuctionDetails() {
  const { id } = useParams();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [rules, setRules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });
  const [submitting, setSubmitting] = useState(false);
  const [fullscreenMediaIndex, setFullscreenMediaIndex] = useState<number | null>(null);
  const [tieBids, setTieBids] = useState<Bid[]>([]);
  const [showTieModal, setShowTieModal] = useState(false);
  const tiePollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [auctionData, bidsData, settingsData] = await Promise.all([
          getAuction(id),
          getBids(id),
          getSettings()
        ]);
        setAuction(auctionData);
        setBids(bidsData);
        setRules(settingsData.auctionRules);
      } catch (error) {
        console.error('Error fetching auction details:', error);
        toast.error('Failed to load auction details');
        setRules(defaultRules);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (!auction) return;

    const endDate = new Date(auction.endDate);
    const timer = setInterval(() => {
      setTimeRemaining(getTimeRemaining(endDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [auction]);

  // ── Tie detection polling ──────────────────────────────────────────────────
  // While auction is active, periodically poll for tie events so *all*
  // watching users (not just the one who submitted) see the modal.
  useEffect(() => {
    if (!id || !auction || auction.status !== 'active') return;

    const pollForTies = async () => {
      try {
        const ties = await getTieBids(id);
        if (ties.length > 0) {
          setTieBids(ties);
          setShowTieModal(true);
        }
      } catch {
        // silently ignore polling errors
      }
    };

    // Poll every 5 seconds while auction is active
    tiePollingRef.current = setInterval(pollForTies, 5000);
    return () => {
      if (tiePollingRef.current) clearInterval(tiePollingRef.current);
    };
  }, [id, auction?.status]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-900 mb-4" />
        <p className="text-gray-600">Loading auction details...</p>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">Auction Not Found</h2>
        <Link to="/auctions">
          <Button className="bg-blue-900 hover:bg-blue-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Auctions
          </Button>
        </Link>
      </div>
    );
  }

  const minBid = auction.currentBid + 5000;

  const handlePlaceBid = async () => {
    const amount = parseFloat(bidAmount);

    if (!mockCurrentUser.isVerified) {
      toast.error('You must be a verified buyer to place bids');
      return;
    }

    if (isNaN(amount) || amount < minBid) {
      toast.error(`Minimum bid is ${formatCurrency(minBid)}`);
      return;
    }

    if (auction.status !== 'active') {
      toast.error('This auction is not currently active');
      return;
    }

    setSubmitting(true);
    try {
      const newBid = await apiPlaceBid({
        auctionId: auction.id,
        userId: mockCurrentUser.id,
        userName: mockCurrentUser.name,
        amount: amount
      });

      setBids([newBid, ...bids]);
      setAuction({ ...auction, currentBid: amount });
      setBidAmount('');

      // Immediately check for ties after placing a bid
      if (newBid.tie_flag) {
        const ties = await getTieBids(auction.id);
        if (ties.length > 0) {
          setTieBids(ties);
          setShowTieModal(true);
        }
      } else {
        toast.success('Bid placed successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to place bid');
    } finally {
      setSubmitting(false);
    }
  };

  const sortedBids = [...bids].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ── Tie Detection Modal ───────────────────────────────────────────── */}
      {showTieModal && tieBids.length > 0 && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white">
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-white/20 p-2 rounded-full">
                  <Users className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">⚖️ Tie Detected!</h2>
              </div>
              <p className="text-amber-100 text-sm">
                Multiple bids were recorded at the exact same microsecond.
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <p className="text-gray-700 font-medium">
                The following bidders submitted the same amount simultaneously:
              </p>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {/* Dedupe by amount+timestamp_us for display */}
                {Array.from(
                  new Map(tieBids.map(b => [b.id, b])).values()
                ).map((bid, i) => (
                  <div key={bid.id} className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-700 font-bold text-sm w-5">{i + 1}.</span>
                      <span className="font-semibold text-gray-800">{bid.userName}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-blue-900">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(bid.amount)}
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(bid.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}.{String(bid.timestamp_us % 1_000_000).padStart(6, '0').slice(0, 3)}ms
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> A tie has been registered. The auction administrator will review and determine the outcome.
                </p>
              </div>

              <button
                onClick={() => setShowTieModal(false)}
                className="w-full bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Custom Fullscreen Viewer */}
      {fullscreenMediaIndex !== null && auction.media && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col pt-safe px-safe">
          <div className="flex justify-end p-6 absolute top-0 right-0 z-[110]">
            <button
              onClick={() => setFullscreenMediaIndex(null)}
              className="text-white hover:text-red-400 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all shadow-lg flex items-center gap-2"
              title="Close Fullscreen"
            >
              <X className="w-6 h-6" />
              <span className="text-sm font-semibold tracking-wide pr-2">Close</span>
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center relative w-full h-full">
            {/* Left Prev Arrow */}
            {fullscreenMediaIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setFullscreenMediaIndex(fullscreenMediaIndex - 1); }}
                className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-black/50 hover:bg-black/80 p-4 rounded-full transition-all z-[110] shadow-lg"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
            )}

            <div className="w-full h-full flex items-center justify-center max-w-7xl mx-auto p-4 md:p-12 relative" onClick={(e) => {
              if (e.target === e.currentTarget) setFullscreenMediaIndex(null);
            }}>
              {auction.media[fullscreenMediaIndex].type === 'image' ? (
                <img
                  src={auction.media[fullscreenMediaIndex].url}
                  alt={auction.title}
                  className="max-w-full max-h-full object-contain drop-shadow-2xl select-none"
                />
              ) : (
                <video
                  src={auction.media[fullscreenMediaIndex].url}
                  controls
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                  autoPlay
                  className="max-w-full max-h-full object-contain shadow-2xl"
                />
              )}
            </div>

            {/* Right Next Arrow */}
            {fullscreenMediaIndex < auction.media.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setFullscreenMediaIndex(fullscreenMediaIndex + 1); }}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-black/50 hover:bg-black/80 p-4 rounded-full transition-all z-[110] shadow-lg"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            )}
          </div>
        </div>
      )}

      <Link to="/auctions">
        <Button variant="ghost" className="mb-6 text-blue-900 hover:bg-blue-50">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Auctions
        </Button>
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Image and Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <Card className="overflow-hidden border-blue-200 shadow-lg">
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 relative border-b border-blue-100">
              {auction.media && auction.media.length > 0 ? (
                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide aspect-video">
                  {auction.media.map((item, index) => (
                    <div key={index} className="flex-shrink-0 w-full snap-center relative group bg-black flex items-center justify-center">
                      {item.type === 'image' ? (
                        <div className="w-full h-full relative cursor-pointer" onClick={() => setFullscreenMediaIndex(index)} title="Click to view fullscreen">
                          <img
                            src={item.url}
                            alt={`${auction.title} - Media ${index + 1}`}
                            className="w-full h-full object-contain transition-transform hover:scale-105"
                          />
                        </div>
                      ) : (
                        <video
                          src={item.url}
                          controls
                          controlsList="nodownload"
                          onContextMenu={(e) => e.preventDefault()}
                          className="w-full h-full object-contain"
                        />
                      )}

                      {/* Fullscreen Overlay Button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setFullscreenMediaIndex(index); }}
                        className="absolute top-4 right-4 bg-black/60 hover:bg-black/90 text-white p-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 backdrop-blur-sm z-10 shadow-lg"
                        title="Open in Fullscreen (or click image)"
                      >
                        <Maximize2 className="w-5 h-5" />
                        <span className="text-sm font-semibold tracking-wide hidden sm:block">Fullscreen</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="aspect-video flex items-center justify-center text-blue-300 bg-blue-50">
                  No Media
                </div>
              )}
            </div>
            {auction.media && auction.media.length > 1 && (
              <div className="p-2 flex justify-center gap-1.5 bg-white border-t">
                {auction.media.map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-blue-300" />
                ))}
              </div>
            )}
          </Card>

          {/* Auction Information */}
          <Card className="border-blue-200 shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Badge className={`${auction.status === 'active'
                      ? 'bg-green-500'
                      : auction.status === 'upcoming'
                        ? 'bg-blue-500'
                        : 'bg-gray-500'
                      }`}>
                      {auction.status.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="border-blue-900 text-blue-900">
                      {auction.gemType}
                    </Badge>
                  </div>
                  <CardTitle className="text-3xl text-blue-900 mb-2">{auction.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700 leading-relaxed">{auction.description}</p>

              <Separator />

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Award className="w-5 h-5 text-blue-900" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Carat Weight</p>
                    <p className="font-semibold text-blue-900">{auction.carat} Carats</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-900" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Origin</p>
                    <p className="font-semibold text-blue-900">{auction.origin}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-900" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Certification</p>
                    <p className="font-semibold text-blue-900">{auction.certification}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-900" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {auction.status === 'upcoming' ? 'Starts' : auction.status === 'active' ? 'Ends' : 'Ended'}
                    </p>
                    <p className="font-semibold text-blue-900">
                      {formatDate(new Date(auction.status === 'upcoming' ? auction.startDate : auction.endDate))}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Legal Documents & Certificates
                </h4>
                <div className="grid gap-2">
                  {auction.legalDocuments && auction.legalDocuments.length > 0 ? (
                    auction.legalDocuments.map((doc, index) => (
                      <a
                        key={index}
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-900" />
                          <span className="text-sm text-blue-900">Document {index + 1}</span>
                        </div>
                        <span className="text-xs text-blue-600 font-medium underline">View / Download</span>
                      </a>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No certificates provided</p>
                  )}
                </div>
              </div>


              {auction.remarks && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Remarks
                    </h4>
                    <p className="text-gray-700 text-sm">{auction.remarks}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Bidding */}
        <div className="space-y-6">
          {/* Countdown Timer */}
          {auction.status === 'active' && (
            <Card className="border-blue-200 shadow-lg bg-gradient-to-br from-blue-900 to-blue-800 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Clock className="w-5 h-5" />
                  Time Remaining
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur">
                    <div className="text-2xl font-bold">{timeRemaining.days}</div>
                    <div className="text-xs text-blue-200">Days</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur">
                    <div className="text-2xl font-bold">{timeRemaining.hours}</div>
                    <div className="text-xs text-blue-200">Hours</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur">
                    <div className="text-2xl font-bold">{timeRemaining.minutes}</div>
                    <div className="text-xs text-blue-200">Min</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur">
                    <div className="text-2xl font-bold">{timeRemaining.seconds}</div>
                    <div className="text-xs text-blue-200">Sec</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Bid */}
          <Card className="border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-blue-900">Current Bid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-900 mb-4">
                {formatCurrency(auction.currentBid)}
              </div>

              {auction.status === 'active' && (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Minimum next bid: {formatCurrency(minBid)}
                  </p>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="bidAmount" className="text-blue-900 font-semibold">Your Bid Amount (LKR)</Label>
                      <Input
                        id="bidAmount"
                        type="number"
                        placeholder={`Min: ${formatCurrency(minBid)}`}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="border-blue-200 text-lg"
                      />
                    </div>
                    <Button
                      onClick={handlePlaceBid}
                      disabled={submitting}
                      className="w-full bg-blue-900 hover:bg-blue-800"
                      size="lg"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Gavel className="w-4 h-4 mr-2" />}
                      Place Bid
                    </Button>
                  </div>
                </>
              )}

              {auction.status === 'upcoming' && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-900 font-semibold">
                    Auction starts on {formatDate(new Date(auction.startDate))}
                  </p>
                </div>
              )}

              {auction.status === 'completed' && auction.winnerName && (
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm text-gray-600">Winner</p>
                  <p className="font-semibold text-blue-900">{auction.winnerName}</p>
                  <Button className="w-full mt-3 bg-blue-900 hover:bg-blue-800">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Team
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bid History */}
          <Card className="border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Bid History ({sortedBids.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {sortedBids.length > 0 ? (
                    sortedBids.map((bid, index) => (
                      <div key={bid.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-blue-900">{bid.userName}</p>
                            <p className="text-xs text-gray-600">
                              {new Date(bid.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="font-bold text-blue-900">
                          {formatCurrency(bid.amount)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-600 py-4">No bids yet</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-blue-900">Need More Information?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Contact our team for detailed information about this gemstone
              </p>
              <Button variant="outline" className="w-full border-blue-900 text-blue-900 hover:bg-blue-50">
                <Phone className="w-4 h-4 mr-2" />
                Call: +94 765427828
              </Button>
            </CardContent>
          </Card>

          {/* Rules */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full border-blue-900 text-blue-900 hover:bg-blue-50">
                <FileText className="w-4 h-4 mr-2" />
                View Auction Rules
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle className="text-2xl text-blue-900">Auction Rules & Guidelines</DialogTitle>
                <DialogDescription className="sr-only">Detailed list of rules and guidelines for participating in this auction.</DialogDescription>
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
      </div>
    </div>
  );
}
