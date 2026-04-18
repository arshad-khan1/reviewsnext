export const BRANDING_TEMPLATES = [
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    backgroundUrl: "https://res.cloudinary.com/demo/image/upload/v1641324103/sample.jpg", // Placeholder
    overlayOpacity: 0.1,
  },
  {
    id: "luxury-dark",
    name: "Luxury Dark",
    backgroundUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=2070&auto=format&fit=crop", 
    overlayOpacity: 0.6,
  },
  {
    id: "vibrant-energy",
    name: "Vibrant Energy",
    backgroundUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop",
    overlayOpacity: 0.3,
  },
];

export const getTemplate = (id: string) => BRANDING_TEMPLATES.find(t => t.id === id);
