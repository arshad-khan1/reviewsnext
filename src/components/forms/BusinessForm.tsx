"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, Upload, Star, MapPin, Sparkles, MessageSquare, Info, Building2, LayoutGrid } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { PhoneInput } from "react-international-phone";

export interface BusinessFormData {
  logo: string;
  name: string;
  industry: string;
  phone: string;
  description: string;
  aiPrompt: string;
  acceptedStars: number;
  notAcceptedStars: number;
  commentStyle: string;
  googleMapsLink: string;
}

const COMMENT_STYLES = [
  "Professional & Polite",
  "Friendly & Casual",
  "Concise & Direct",
  "Enthusiastic & Warm",
];

interface BusinessFormProps {
  initialData?: Partial<BusinessFormData>;
  onSubmit: (data: BusinessFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  disablePhone?: boolean;
}

export default function BusinessForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isSubmitting,
  disablePhone = false 
}: BusinessFormProps) {
  const [formData, setFormData] = useState<BusinessFormData>({
    logo: initialData?.logo || "",
    name: initialData?.name || "",
    industry: initialData?.industry || "",
    phone: initialData?.phone || "",
    description: initialData?.description || "",
    aiPrompt: initialData?.aiPrompt || "",
    acceptedStars: initialData?.acceptedStars || 4,
    notAcceptedStars: initialData?.notAcceptedStars || 3,
    commentStyle: initialData?.commentStyle || "Professional & Polite",
    googleMapsLink: initialData?.googleMapsLink || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThresholdChange = (stars: number) => {
    // If they click on star N, it means 1 to N are suggestions, and N+1 to 5 are accepted reviews.
    // E.g., click 3 -> notAccepted: 3, accepted: 4
    setFormData(prev => ({
      ...prev,
      notAcceptedStars: stars,
      acceptedStars: stars < 5 ? stars + 1 : 5
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClassName = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const labelClassName = "text-sm font-medium leading-none mb-1.5 block";

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANEL */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-semibold text-foreground">Business Profile</h3>
              <p className="text-xs text-muted-foreground mt-1">Basic public information</p>
            </div>
            <div className="p-5 space-y-5">
              
              {/* Logo Upload */}
              <div className="space-y-3">
                <label className={labelClassName}>Business Logo</label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 bg-muted/20 hover:bg-muted/50 transition-colors group cursor-pointer relative">
                  {formData.logo ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-background shadow-sm border p-1">
                      <Image 
                        src={formData.logo} 
                        alt="Logo preview" 
                        fill
                        className="object-contain" 
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-3 shadow-inner">
                      <Upload className="w-8 h-8 opacity-50" />
                    </div>
                  )}
                  <p className="text-sm font-medium mt-3 text-foreground group-hover:text-primary transition-colors">
                    Upload new logo
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 text-center">
                    SVG, PNG, JPG or GIF (max. 2MB)
                  </p>
                  {/* Hidden file input would go here, fallback to URL text input for mock */}
                  <div className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Mock Upload">
                     {/* A real file input would be invisible here */}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1.5">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <label className="text-sm font-medium leading-none">Business Name</label>
                </div>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Acme Corp"
                  className={inputClassName}
                />
              </div>

              <div className="space-y-2">
                <label className={labelClassName}>Phone Number</label>
                <div className={disablePhone ? "opacity-70 grayscale-[0.5]" : ""}>
                  <PhoneInput
                    defaultCountry="in"
                    value={formData.phone}
                    onChange={(phone) => setFormData(prev => ({ ...prev, phone }))}
                    disabled={disablePhone}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1.5">
                  <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                  <label className="text-sm font-medium leading-none">Industry</label>
                </div>
                <select
                  required
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className={inputClassName}
                >
                  <option value="" disabled>Select an industry...</option>
                  <option value="Restaurants & Cafes">Restaurants & Cafes</option>
                  <option value="E-commerce & Retail">E-commerce & Retail</option>
                  <option value="Health & Wellness">Health & Wellness</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Automotive Services">Automotive Services</option>
                  <option value="Hospitality & Tourism">Hospitality & Tourism</option>
                  <option value="Professional Services">Professional Services</option>
                  <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                  <option value="Education & Training">Education & Training</option>
                  <option value="Home Services">Home Services</option>
                  <option value="Financial Services">Financial Services</option>
                  <option value="Technology & Software">Technology & Software</option>
                  <option value="Entertainment & Events">Entertainment & Events</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className={labelClassName}>Description</label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell your customers about what you do..."
                  className="min-h-[140px] resize-y"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Feedback Routing (Stars) */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-semibold text-foreground">Review Routing</h3>
              <p className="text-xs text-muted-foreground mt-1">Control which ratings go to Google and which are kept as private feedback</p>
            </div>
            <div className="p-6">
              
              <div className="mb-6 flex space-x-2 p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium items-start">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <p>Click on a star to set the threshold. Ratings <strong>up to the selected star</strong> will be directed to an internal suggestion form, while <strong>higher ratings</strong> will be encouraged to review on Google Maps.</p>
              </div>

              <div className="flex flex-col items-center justify-center py-6">
                <div className="flex gap-2 group">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isSuggestion = star <= formData.notAcceptedStars;
                    
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleThresholdChange(star)}
                        className={`p-3 rounded-full transition-all duration-200 cursor-pointer
                          ${isSuggestion 
                            ? "bg-orange-100 text-orange-500 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400" 
                            : "bg-green-100 text-green-500 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"}
                          hover:scale-110 active:scale-95`}
                        title={isSuggestion ? "Internal Feedback" : "Google Review"}
                      >
                        <Star className={`w-8 h-8 ${isSuggestion ? "" : "fill-current"}`} strokeWidth={isSuggestion ? 2 : 1} />
                      </button>
                    );
                  })}
                </div>
                
                <div className="flex justify-between w-full max-w-sm mt-6 text-sm">
                  <div className="flex flex-col items-center gap-1 text-orange-600 dark:text-orange-400 font-medium">
                    <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-xs">
                      {formData.notAcceptedStars === 1 ? '1 Star' : `1-${formData.notAcceptedStars} Stars`}
                    </span>
                    <span>Internal Suggestions</span>
                  </div>
                  {formData.acceptedStars <= 5 && formData.notAcceptedStars < 5 ? (
                    <div className="flex flex-col items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                      <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-xs">
                        {formData.acceptedStars === 5 ? '5 Stars' : `${formData.acceptedStars}-5 Stars`}
                      </span>
                      <span>Google Reviews</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Configuration & AI */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-semibold text-foreground">Advanced Settings</h3>
              <p className="text-xs text-muted-foreground mt-1">AI prompts and integrations</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <label className="text-sm font-medium leading-none">Google Maps Review Link</label>
                </div>
                <input
                  required
                  type="url"
                  name="googleMapsLink"
                  value={formData.googleMapsLink}
                  onChange={handleChange}
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  className={inputClassName}
                />
                <p className="text-xs text-muted-foreground">Customers who give high ratings will be redirected to this link.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-muted-foreground" />
                    <label className="text-sm font-medium leading-none">AI Guiding Prompt</label>
                  </div>
                  <Textarea
                    name="aiPrompt"
                    value={formData.aiPrompt}
                    onChange={handleChange}
                    placeholder="Instructions for the AI on how to interact with customers..."
                    className="min-h-[120px] resize-y"
                  />
                  <p className="text-xs text-muted-foreground">System prompt used to guide our AI assistant when resolving negative feedback.</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <label className="text-sm font-medium leading-none">Generated Comment Style</label>
                  </div>
                  <select
                    name="commentStyle"
                    value={formData.commentStyle}
                    onChange={handleChange}
                    className={inputClassName}
                  >
                    {COMMENT_STYLES.map(style => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">Sets the tone of voice for AI-suggested review drafts for happy customers.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onCancel} className="px-6">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2 px-8 min-w-[140px] shadow-sm">
              <Save className="w-4 h-4" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>

        </div>
      </div>
    </form>
  );
}
