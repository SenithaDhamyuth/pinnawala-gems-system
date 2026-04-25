import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  getAuction,
  createAuction as apiCreateAuction,
  updateAuction as apiUpdateAuction,
  uploadFile
} from '../services/api';
import { ArrowLeft, Save, Calendar, Loader2, Upload, X, FileIcon, Video, ArrowLeftCircle, ArrowRightCircle, Pin } from 'lucide-react';
import { toast } from 'sonner';
import { type MediaItem } from '../services/api';

export function CreateAuction() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    gemType: '',
    carat: '',
    origin: '',
    certification: '',
    description: '',
    startDate: '',
    endDate: '',
    startingBid: '',
    media: [] as MediaItem[],
    legalDocuments: [] as string[],
    remarks: '',
  });

  useEffect(() => {
    if (isEdit && id) {
      getAuction(id)
        .then(auction => {
          setFormData({
            title: auction.title,
            gemType: auction.gemType,
            carat: auction.carat.toString(),
            origin: auction.origin,
            certification: auction.certification,
            description: auction.description,
            startDate: new Date(auction.startDate).toISOString().slice(0, 16),
            endDate: new Date(auction.endDate).toISOString().slice(0, 16),
            startingBid: auction.startingBid.toString(),
            media: auction.media || [],
            legalDocuments: auction.legalDocuments || [],
            remarks: auction.remarks || '',
          });
        })
        .catch(err => {
          console.error(err);
          toast.error('Failed to load auction for editing');
          navigate('/admin');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.gemType || !formData.startDate || !formData.endDate || !formData.startingBid) {
      toast.error('Please fill in all required fields');
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (endDate <= startDate) {
      toast.error('End date must be after start date');
      return;
    }

    setSubmitting(true);
    const payload = {
      title: formData.title,
      gemType: formData.gemType,
      carat: parseFloat(formData.carat),
      origin: formData.origin,
      certification: formData.certification,
      description: formData.description,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      startingBid: parseFloat(formData.startingBid),
      media: formData.media,
      legalDocuments: formData.legalDocuments,
      remarks: formData.remarks,
    };

    try {
      if (isEdit && id) {
        await apiUpdateAuction(id, payload);
        toast.success('Auction updated successfully!');
      } else {
        await apiCreateAuction(payload);
        toast.success('Auction created successfully!');
      }
      navigate('/admin');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save auction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'media' | 'legalDocuments', mediaType?: 'image' | 'video') => {
    const files = e.target.files;
    if (!files) return;

    setSubmitting(true);

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await uploadFile(files[i]);
        uploadedUrls.push(res.url);
      }

      setFormData(prev => {
        if (type === 'legalDocuments') {
          return {
            ...prev,
            legalDocuments: [...prev.legalDocuments, ...uploadedUrls]
          };
        } else {
          // It's media
          const newMediaItems = uploadedUrls.map(url => ({
            url,
            type: mediaType || 'image'
          } as MediaItem));
          return {
            ...prev,
            media: [...prev.media, ...newMediaItems]
          };
        }
      });
      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload one or more files');
    } finally {
      setSubmitting(false);
    }
  };

  const removeFile = (index: number, type: 'media' | 'legalDocuments') => {
    setFormData(prev => ({
      ...prev,
      [type]: (prev[type as keyof typeof prev] as any[]).filter((_, i) => i !== index)
    }));
  };

  const moveMedia = (index: number, direction: 'left' | 'right') => {
    const newMedia = [...formData.media];
    if (direction === 'left' && index > 0) {
      [newMedia[index - 1], newMedia[index]] = [newMedia[index], newMedia[index - 1]];
    } else if (direction === 'right' && index < newMedia.length - 1) {
      [newMedia[index + 1], newMedia[index]] = [newMedia[index], newMedia[index + 1]];
    } else {
      return; // Can't move further
    }
    setFormData(prev => ({ ...prev, media: newMedia }));
  };

  const togglePin = (index: number) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.map((item, i) => ({
        ...item,
        isPinned: i === index // ensure only one is pinned
      }))
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-900 mb-4" />
        <p className="text-gray-600">Loading auction data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/admin">
        <Button variant="ghost" className="mb-6 text-blue-900 hover:bg-blue-50">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      <Card className="border-blue-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            {isEdit ? 'Edit Auction' : 'Create New Auction'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-blue-900 border-b pb-2">Basic Information</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Auction Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Ceylon Blue Sapphire - 15.5 Carat"
                    className="border-blue-200"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gemType">Gemstone Type *</Label>
                  <Input
                    id="gemType"
                    name="gemType"
                    value={formData.gemType}
                    onChange={handleChange}
                    placeholder="e.g., Sapphire, Ruby, Emerald"
                    className="border-blue-200"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="carat">Carat Weight *</Label>
                  <Input
                    id="carat"
                    name="carat"
                    type="number"
                    step="0.1"
                    value={formData.carat}
                    onChange={handleChange}
                    placeholder="e.g., 15.5"
                    className="border-blue-200"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="origin">Origin *</Label>
                  <Input
                    id="origin"
                    name="origin"
                    value={formData.origin}
                    onChange={handleChange}
                    placeholder="e.g., Sri Lanka, Myanmar"
                    className="border-blue-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="certification">Certification *</Label>
                <Input
                  id="certification"
                  name="certification"
                  value={formData.certification}
                  onChange={handleChange}
                  placeholder="e.g., GIA Certified, IGI Certified"
                  className="border-blue-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detailed description of the gemstone..."
                  className="border-blue-200 min-h-[120px]"
                  required
                />
              </div>
            </div>

            {/* Auction Schedule */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-blue-900 border-b pb-2">Auction Schedule</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date & Time *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="border-blue-200"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date & Time *</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="border-blue-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startingBid">Starting Bid (LKR) *</Label>
                <Input
                  id="startingBid"
                  name="startingBid"
                  type="number"
                  step="1000"
                  value={formData.startingBid}
                  onChange={handleChange}
                  placeholder="e.g., 80000000"
                  className="border-blue-200"
                  required
                />
              </div>
            </div>

            {/* Media & Documents */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-blue-900 border-b pb-2">Media & Documents</h3>

              <div className="space-y-4">
                <div>
                  <Label>Gemstone Media Gallery *</Label>
                  <p className="text-xs text-gray-600 mb-4">Upload images and videos. Use the arrows to reorder them how you want them displayed to users.</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                    {formData.media.map((item, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-blue-200 group bg-blue-50 shadow-sm flex flex-col">
                        <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
                          {item.type === 'image' ? (
                            <img src={item.url} alt="Media" className="w-full h-full object-cover" />
                          ) : (
                            <video src={item.url} className="w-full h-full object-cover" />
                          )}

                          {/* Top Left Action - Pin */}
                          <button
                            type="button"
                            onClick={() => togglePin(index)}
                            className={`absolute top-1 left-1 p-1.5 rounded-full shadow-md z-10 transition-all ${item.isPinned ? 'bg-blue-600 text-white opacity-100' : 'bg-white/80 text-gray-500 hover:bg-blue-100 opacity-0 group-hover:opacity-100'}`}
                            title={item.isPinned ? "Pinned as cover" : "Pin as cover"}
                          >
                            <Pin className="w-3 h-3" />
                          </button>

                          {/* Top Right Action - Remove */}
                          <button
                            type="button"
                            onClick={() => removeFile(index, 'media')}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                            title="Remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Ordering Controls Strip */}
                        <div className="flex items-center justify-between px-2 py-1 bg-white border-t border-blue-100">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveMedia(index, 'left')}
                            className="text-blue-500 hover:text-blue-700 disabled:opacity-30 disabled:hover:text-blue-500"
                            title="Move Left"
                          >
                            <ArrowLeftCircle className="w-5 h-5" />
                          </button>

                          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                            {item.type === 'video' ? <Video className="w-3 h-3" /> : 'IMG'}
                            <span>{index + 1}</span>
                          </div>

                          <button
                            type="button"
                            disabled={index === formData.media.length - 1}
                            onClick={() => moveMedia(index, 'right')}
                            className="text-blue-500 hover:text-blue-700 disabled:opacity-30 disabled:hover:text-blue-500"
                            title="Move Right"
                          >
                            <ArrowRightCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add Image/Video Buttons */}
                    <div className="flex flex-col gap-2 relative aspect-square">
                      <label className="flex-1 rounded-lg border-2 border-dashed border-blue-200 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors text-center p-2">
                        <Upload className="w-5 h-5 text-blue-400 mb-1" />
                        <span className="text-[10px] text-blue-900 font-medium">Add Image(s)</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'media', 'image')}
                        />
                      </label>
                      <label className="flex-1 rounded-lg border-2 border-dashed border-blue-200 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors text-center p-2">
                        <Video className="w-5 h-5 text-blue-400 mb-1" />
                        <span className="text-[10px] text-blue-900 font-medium">Add Video(s)</span>
                        <input
                          type="file"
                          accept="video/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'media', 'video')}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-2">
                <Label>Legal Documents & Certificates</Label>
                <div className="grid grid-cols-1 gap-2 mb-2">
                  {formData.legalDocuments.map((url, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100 group">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileIcon className="w-4 h-4 text-blue-900 flex-shrink-0" />
                        <span className="text-xs text-blue-900 truncate">{url.split('/').pop()}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index, 'legalDocuments')}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <label className="w-full h-10 rounded-lg border-2 border-dashed border-blue-200 flex items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors gap-2">
                    <Upload className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-blue-900 font-medium">Upload Document</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'legalDocuments')}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-600 italic">Upload GIA/IGI certificates, etc.</p>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-blue-900 border-b pb-2">Additional Information</h3>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Special notes, investment highlights, etc."
                  className="border-blue-200"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 Brewster border-t">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-blue-900 hover:bg-blue-800 flex-1"
                size="lg"
              >
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {isEdit ? 'Update Auction' : 'Create Auction'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin')}
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
