/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  ShoppingCart, CheckCircle, Package, Truck, ShieldCheck, 
  Star, LogOut, Trash2, Save, Image as ImageIcon,
  ChevronLeft, Phone, Eye, Clock, Home, Building,
  Flame, Zap, Timer, ChefHat, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// For motion v12, if framer-motion doesn't work, we might need motion/react, 
// but usually framer-motion is preserved for compatibility. 
// Adding a check for Star in the ICON_MAP.

// --- Types ---
interface Order {
  id: string;
  name: string;
  phone: string;
  wilaya: string;
  commune: string;
  deliveryType: 'office' | 'home';
  quantity: number;
  total: number;
  date: string;
}

interface ProductData {
  name: string;
  originalPrice: number;
  currentPrice: number;
  discount: string;
  images: string[];
  features: { title: string; desc: string; img: string; icon: string }[];
  stats: { val: string; lab: string }[];
  siteName: string;
}

const ICON_MAP: Record<string, any> = {
  ChefHat, Zap, Package, Flame, Timer, Clock, Sparkles, Star, ShieldCheck, Truck, ShoppingCart
};

const resizeImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    };
  });
};

// --- Constants ---
const WILAYAS = [
  "01 - Adrar", "02 - Chlef", "03 - Laghouat", "04 - Oum El Bouaghi", "05 - Batna", 
  "06 - Béجايا", "07 - Biskra", "08 - Béchar", "09 - Blida", "10 - Bouira", 
  "11 - Tamanrasset", "12 - Tébessa", "13 - Tlemcen", "14 - Tiaret", "15 - Tizi Ouzou", 
  "16 - Alger", "17 - Djelfa", "18 - Jijel", "19 - Sétif", "20 - Saïدا", 
  "21 - Skikda", "22 - Sidi Bel Abbès", "23 - Annaba", "24 - Guelma", "25 - Constantine", 
  "26 - Médéa", "27 - Mostaganem", "28 - M'Sila", "29 - Mascara", "30 - Ouargla", 
  "31 - Oran", "32 - El Bayadh", "33 - Illizi", "34 - Bordj Bou Arreridj", "35 - Boumerdès", 
  "36 - El Tarf", "37 - Tindouf", "38 - Tissemsilt", "39 - El Oued", "40 - Khenchela", 
  "41 - Souk Ahras", "42 - Tipaza", "43 - Mila", "44 - Aïn Defla", "45 - Naâma", 
  "46 - Aïn Témouchent", "47 - Ghardaïa", "48 - Relizane", "49 - El M'Ghair", "50 - El Meniaa", 
  "51 - Ouled Djellal", "52 - Bordj Baji Mokhtar", "53 - Béni Abbès", "54 - Timimoun", "55 - Touggourt", 
  "56 - Djanet", "57 - In Salah", "58 - In Guezzam",
  "59 - Bou Saâda", "60 - Messad", "61 - Barika", "62 - Ain Beida", "63 - Chelghoum Laid", 
  "64 - Lakhdaria", "65 - Sour El Ghozlane", "66 - Ksar El Boukhari", "67 - Cherchell", "68 - Tenes", "69 - Maghnia"
];

const DEFAULT_PRODUCT: ProductData = {
  name: "Ninja® PC201GY HyperHeat™ 9-in-1 Pressure Cooker (6.5 Qt)",
  originalPrice: 69000,
  currentPrice: 67000,
  discount: "-3%",
  images: [
    "/src/assets/images/ninja_hyperheat_hero_1793292196156.jpg",
    "/src/assets/images/ninja_hyperheat_lifestyle_1793296732476.jpg",
    "/src/assets/images/ninja_hyperheat_functions_1793296732534.jpg",
    "/src/assets/images/ninja_hyperheat_family_meal_1793296731306.jpg"
  ],
  features: [
    { 
      title: "9 وظائف إحترافية / 9 Fonctions en 1", 
      desc: "جهاز واحد يعوض 9 أجهزة: طنجرة ضغط، مقلاة هوائية، تبخير، طهي بطيء، صنع زبادي، تحمير، والمزيد. كل ما تحتاجه في مطبخك العصري.",
      img: "/src/assets/images/ninja_hyperheat_functions_1793296732534.jpg",
      icon: "ChefHat"
    },
    { 
      title: "طهي أسرع بمرتين / Cuisson 2X plus rapide", 
      desc: "بفضل تقنية HyperHeat™ المبتكرة، يمكنك طهي الوجبات المجمدة وتحويلها إلى أطباق مقرمشة وساخنة في وقت قياسي جداً.",
      img: "/src/assets/images/ninja_hyperheat_detail_1793292209515.jpg",
      icon: "Zap"
    },
    { 
      title: "سعة عائلية ضخمة 6.5 لتر / Grande Capacité 6.5 Qt", 
      desc: "وعاء يتسع لدجاجة كاملة بوزن 2.3 كغ أو 1.8 كغ من البطاطس المقلية. مثالي للعائلات الجزائرية الكبيرة والضيوف.",
      img: "/src/assets/images/ninja_hyperheat_family_meal_1793296731306.jpg",
      icon: "Package"
    },
    { 
      title: "قلي صحي ومقرمش / Air Fry & Crisp", 
      desc: "استمتع بمذاق القلي المفضل لديك بدهون أقل بنسبة تصل إلى 75% مقارنة بطرق القلي التقليدية. قرمشة مثالية بدون زيت.",
      img: "/src/assets/images/ninja_hyperheat_air_fryer_crispy_1793296978253.jpg",
      icon: "Flame"
    },
    { 
      title: "تبخير الوجبات الصحية / Cuisson à la Vapeur", 
      desc: "حافظ على الفيتامينات والقيم الغذائية للخضروات والأسماك من خلال وظيفة التبخير السريعة والفعالة.",
      img: "/src/assets/images/ninja_hyperheat_steam_vegetables_1793296979421.jpg",
      icon: "Timer"
    },
    { 
      title: "طهي بطيء للشوربة والمرق / Slow Cook", 
      desc: "مثالي لتحضير الشوربة الجزائرية والأطباق التقليدية التي تحتاج طهياً هادئاً لساعات طويلة للحصول على نكهة مركزة.",
      img: "/src/assets/images/ninja_hyperheat_slow_cook_stew_1793296980291.jpg",
      icon: "Clock"
    },
    { 
      title: "تنظيف سهل في ثوانٍ / Nettoyage facile", 
      desc: "وعاء Ceramic SimplyServe™ مضاد للالتصاق وخالي تماماً من المواد الكيميائية الضارة (PFAS). آمن في غسالة الأطباق.",
      img: "/src/assets/images/ninja_hyperheat_easy_clean_1793296979730.jpg",
      icon: "Sparkles"
    },
    { 
      title: "طهي السو فيد / Sous Vide", 
      desc: "تقنية الطهي الدقيق في أكياس مفرغة من الهواء للحصول على نتائج مطاعم النجوم في منزلك. لحوم طرية جداً ونكهات غنية.",
      img: "https://images.unsplash.com/photo-1582231940989-138385d89855?auto=format&fit=crop&q=80&w=800",
      icon: "Timer"
    },
    { 
      title: "صنع الياغورت / Mode Yaourt", 
      desc: "حضّر الياغورت (الزبادي) المنزلي الصحي والخالي من المواد الحافظة لعائلتك بكل سهولة وبضغطة زر واحدة.",
      img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=800",
      icon: "ChefHat"
    }
  ],
  stats: [
    { val: "9-in-1", lab: "أجهزة في واحد" },
    { val: "1200W", lab: "قوة طهي هائلة" },
    { val: "6.5L", lab: "سعة عائلية ضخمة" },
    { val: "PFAS-0", lab: "صحي آمن 100%" }
  ],
  siteName: "ROZAKITCHENDZ"
};

const SHIPPING_OFFICE = 700;
const SHIPPING_HOME = 1000;

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [productData, setProductData] = useState<ProductData>(DEFAULT_PRODUCT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', phone: '', wilaya: '', commune: '', deliveryType: 'home' as 'office' | 'home', quantity: 1
  });

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<ProductData>(productData);

  useEffect(() => {
    const savedOrders = localStorage.getItem('roza_beauty_orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    
    const savedProduct = localStorage.getItem('roza_beauty_product');
    if (savedProduct) {
        try {
          const parsed = JSON.parse(savedProduct);
          // Migration/Validation: Ensure features is the new object structure
          const isValidFeatures = Array.isArray(parsed.features) && parsed.features.length > 0 && typeof parsed.features[0] === 'object';
          
          if (isValidFeatures) {
            // Merge with defaults to pick up new fields (siteName, stats)
            const merged = { ...DEFAULT_PRODUCT, ...parsed };
            setProductData(merged);
            setEditData(merged);
          } else {
            console.warn("Incompatible data format, using defaults.");
          }
        } catch (e) {
          console.error("Error parsing saved product:", e);
        }
    }
    const handleError = (e: ErrorEvent) => { if (e.target instanceof HTMLImageElement) e.target.src = "https://placehold.co/600x400?text=Image+Not+Found"; };
    window.addEventListener('error', handleError, true);
    return () => window.removeEventListener('error', handleError, true);
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '2009') { setIsAdmin(true); setShowAdminLogin(false); setPassword(''); } else alert('كلمة المرور خاطئة');
  };

  const handleSaveProduct = () => {
    setProductData(editData);
    localStorage.setItem('roza_beauty_product', JSON.stringify(editData));
    setEditMode(false);
    alert('تم حفظ التغييرات بنجاح');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const resizedImages = await Promise.all(Array.from(files).map(file => resizeImage(file)));
    setEditData(prev => ({ ...prev, images: [...prev.images, ...resizedImages] }));
  };

  const removeImage = (index: number) => { setEditData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) })); };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.wilaya) { alert('يرجى اختيار الولاية'); return; }
    setIsSubmitting(true);
    const shipping = formData.deliveryType === 'home' ? SHIPPING_HOME : SHIPPING_OFFICE;
    const total = (formData.quantity * productData.currentPrice) + shipping;
    const newOrder: Order = { id: Date.now().toString(), ...formData, total, date: new Date().toLocaleString('ar-DZ') };
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('roza_beauty_orders', JSON.stringify(updatedOrders));
    setTimeout(() => { setIsSubmitting(false); setIsSuccess(true); setFormData({ name: '', phone: '', wilaya: '', commune: '', deliveryType: 'home', quantity: 1 }); setTimeout(() => setIsSuccess(false), 5000); }, 1500);
  };

  const deleteOrder = (id: string) => { if (confirm('حذف الطلب؟')) { const updatedOrders = orders.filter(o => o.id !== id); setOrders(updatedOrders); localStorage.setItem('roza_beauty_orders', JSON.stringify(updatedOrders)); } };

  const scrollToForm = () => { document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' }); };

  if (isAdmin) {
    const totalRevenue = orders.reduce((acc, curr) => acc + curr.total, 0);
    return (
      <div className="min-h-screen bg-[#FDF2F5] p-4 md:p-8 font-sans" dir="rtl">
        <div className="max-w-6xl mx-auto">
          <header className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100 flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="flex items-center gap-4"><div className="w-12 h-12 bg-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg"><ShieldCheck size={28} /></div><div><h1 className="text-2xl font-black text-slate-900 leading-none">لوحة الإدارة</h1><p className="text-slate-400 text-xs mt-1 font-bold uppercase">ROZAKITCHENDZ</p></div></div>
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100"><button onClick={() => setEditMode(false)} className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${!editMode ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500'}`}>الطلبات</button><button onClick={() => setEditMode(true)} className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${editMode ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500'}`}>تعديل المنتج</button></div>
            <div className="flex items-center gap-3"><button onClick={() => { if (confirm('إعادة الضبط؟')) { localStorage.clear(); window.location.reload(); } }} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100"><Trash2 size={20} /></button><button onClick={() => setIsAdmin(false)} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl"><LogOut size={18} /> خروج</button></div>
          </header>
          {!editMode && (<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"><div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm"><Package size={22} className="text-pink-500 mb-4" /><h3 className="text-3xl font-black text-slate-900">{orders.length}</h3><p className="text-slate-400 text-xs font-bold mt-1 uppercase">Total Orders</p></div><div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm"><ShoppingCart size={22} className="text-emerald-500 mb-4" /><h3 className="text-3xl font-black text-slate-900">{totalRevenue.toLocaleString()} د.ج</h3><p className="text-slate-400 text-xs font-bold mt-1 uppercase">Estimated Revenue</p></div><div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm"><Clock size={22} className="text-blue-500 mb-4" /><h3 className="text-xl font-black text-slate-900">{orders.length > 0 ? orders[0].date.split(',')[0] : '---'}</h3><p className="text-slate-400 text-xs font-bold mt-1 uppercase">Last Received</p></div></div>)}
          {editMode ? (
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-pink-100 space-y-10">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-700 uppercase">اسم المتجر / Nom du magasin</label>
                  <input type="text" value={editData.siteName} onChange={e => setEditData({...editData, siteName: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-slate-200" />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-700 uppercase">اسم المنتج / Nom du produit</label>
                  <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-slate-200" />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-700 uppercase">السعر / Prix (DA)</label>
                  <input type="number" value={editData.currentPrice} onChange={e => setEditData({...editData, currentPrice: Number(e.target.value)})} className="w-full px-5 py-4 rounded-2xl border border-slate-200 text-pink-600 font-bold" />
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-sm font-black text-slate-700 uppercase">معرض الصور / Galerie</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 border-2 border-dashed border-pink-100 p-6 rounded-[2rem] bg-slate-50/50">
                  {editData.images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm flex items-center justify-center p-1 group">
                      <img src={img} className="max-w-full max-h-full object-contain" />
                      <button onClick={() => removeImage(i)} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={20} /></button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-pink-200 flex flex-col items-center justify-center gap-2 cursor-pointer text-pink-300 hover:text-pink-500">
                    <ImageIcon size={24} />
                    <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-sm font-black text-slate-700 uppercase">الميزات / Caractéristiques (9-in-1)</label>
                <div className="grid gap-6">
                  {editData.features.map((feature, i) => (
                    <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-pink-500">ميزة # {i + 1}</span>
                        <select 
                          value={feature.icon} 
                          onChange={e => {
                            const newFeatures = [...editData.features];
                            newFeatures[i].icon = e.target.value;
                            setEditData({...editData, features: newFeatures});
                          }}
                          className="text-[10px] bg-white px-2 py-1 rounded-full text-slate-400 font-mono border border-slate-100 cursor-pointer outline-none"
                        >
                          {Object.keys(ICON_MAP).map(iconName => (
                            <option key={iconName} value={iconName}>{iconName}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-32 aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm flex items-center justify-center relative group">
                          <img src={feature.img} className="max-w-full max-h-full object-cover" />
                          <label className="absolute inset-0 bg-pink-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <ImageIcon size={20} />
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const resized = await resizeImage(file);
                                  const newFeatures = [...editData.features];
                                  newFeatures[i].img = resized;
                                  setEditData({...editData, features: newFeatures});
                                }
                              }}
                            />
                          </label>
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          <input 
                            type="text" 
                            value={feature.title} 
                            onChange={e => {
                              const newFeatures = [...editData.features];
                              newFeatures[i].title = e.target.value;
                              setEditData({...editData, features: newFeatures});
                            }}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-black"
                            placeholder="العنوان / Titre"
                          />
                          <textarea 
                            value={feature.desc} 
                            onChange={e => {
                              const newFeatures = [...editData.features];
                              newFeatures[i].desc = e.target.value;
                              setEditData({...editData, features: newFeatures});
                            }}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs h-20"
                            placeholder="الوصف / Description"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-sm font-black text-slate-700 uppercase">إحصائيات / Statistiques (Why Choose?)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {editData.stats.map((stat, i) => (
                    <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                      <input 
                        type="text" 
                        value={stat.val} 
                        onChange={e => {
                          const newStats = [...editData.stats];
                          newStats[i].val = e.target.value;
                          setEditData({...editData, stats: newStats});
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-black text-pink-500"
                        placeholder="Value (e.g. 9-in-1)"
                      />
                      <input 
                        type="text" 
                        value={stat.lab} 
                        onChange={e => {
                          const newStats = [...editData.stats];
                          newStats[i].lab = e.target.value;
                          setEditData({...editData, stats: newStats});
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[10px] font-bold"
                        placeholder="Label"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <button onClick={handleSaveProduct} className="px-12 py-5 bg-pink-500 text-white rounded-3xl font-black text-xl flex items-center gap-3 shadow-2xl hover:bg-pink-600 transition-all">
                  <Save size={24} /> حفظ التغييرات / Sauvegarder
                </button>
              </div>
            </div>
          ) : (
<div className="bg-white rounded-[2.5rem] shadow-sm border border-pink-100 overflow-hidden"><div className="p-8 border-b border-pink-50 flex justify-between items-center bg-slate-50/50"><h2 className="text-xl font-black text-slate-900">سجل الطلبات</h2><button onClick={() => { if (confirm('مسح الكل؟')) { setOrders([]); localStorage.removeItem('roza_beauty_orders'); } }} className="px-5 py-2.5 bg-red-50 text-red-500 rounded-xl text-xs font-black">Effacer tout</button></div><div className="overflow-x-auto"><table className="w-full text-right border-collapse"><thead><tr className="bg-slate-50/80 border-b border-pink-50"><th className="px-8 py-5 text-[10px] font-black text-slate-400">التاريخ</th><th className="px-8 py-5 text-[10px] font-black text-slate-400">الزبون</th><th className="px-8 py-5 text-[10px] font-black text-slate-400">الهاتف</th><th className="px-8 py-5 text-[10px] font-black text-slate-400">العنوان</th><th className="px-8 py-5 text-[10px] font-black text-slate-400 text-center">التوصيل</th><th className="px-8 py-5 text-[10px] font-black text-slate-400">المجموع</th><th className="px-8 py-5 text-[10px] font-black text-slate-400 text-center">حذف</th></tr></thead><tbody className="divide-y divide-pink-50/50">{orders.map(order => (<tr key={order.id} className="hover:bg-pink-50/30 transition-colors"><td className="px-8 py-5 text-xs text-slate-400 font-mono">{order.date}</td><td className="px-8 py-5 text-sm font-black text-slate-900">{order.name}</td><td className="px-8 py-5 text-sm text-slate-700 font-mono">{order.phone}</td><td className="px-8 py-5 text-xs text-slate-700"><div className="font-black text-pink-600">{order.wilaya}</div><div className="text-slate-400 font-bold">{order.commune}</div></td><td className="px-8 py-5 text-center font-bold text-[10px] uppercase text-slate-500">{order.deliveryType === 'home' ? '🏠 Domicile' : '🏢 Bureau'}</td><td className="px-8 py-5 text-sm font-black text-pink-600">{order.total.toLocaleString()} د.ج</td><td className="px-8 py-5 text-center"><button onClick={() => deleteOrder(order.id)} className="w-10 h-10 text-red-300 hover:text-red-500 transition-all inline-flex items-center justify-center bg-red-50/0 hover:bg-red-50 rounded-xl"><Trash2 size={18} /></button></td></tr>))}</tbody></table></div></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-pink-100" dir="rtl">
      {/* Admin Login Modal */}
      <AnimatePresence>{showAdminLogin && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdminLogin(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" /><motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm"><h3 className="text-xl font-bold mb-4 text-center uppercase tracking-tighter">Admin Access</h3><form onSubmit={handleAdminLogin} className="space-y-4"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pink-500 outline-none" autoFocus /><button type="submit" className="w-full py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-all uppercase">Login</button></form></motion.div></div>)}</AnimatePresence>

      <div className="bg-slate-900 text-white py-2 px-4 overflow-hidden whitespace-nowrap text-center">
        <div className="flex justify-center items-center gap-6 text-[10px] md:text-xs font-black uppercase tracking-widest">
          <span className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-400" /> Original Brand Product</span>
          <span className="flex items-center gap-2"><Truck size={14} className="text-pink-400" /> Livraison 58 Wilayas</span>
        </div>
      </div>

      <header className="bg-white/90 backdrop-blur-xl px-4 py-4 sticky top-0 z-40 shadow-sm border-b border-pink-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button onClick={() => setShowAdminLogin(true)} className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 uppercase hover:opacity-80 transition-opacity outline-none focus:outline-none"><span className="text-pink-500">{productData.siteName}</span></button>
          <button onClick={scrollToForm} className="bg-pink-500 text-white px-6 py-2.5 rounded-2xl font-black text-xs shadow-lg shadow-pink-200 active:scale-95 transition-all">أطلب الآن / Commander</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        
        {/* Main Product Intro */}
        <section className="px-4 py-16 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-8 px-2" translate="no">{productData.name}</h1>
          
          <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-pink-100 border border-pink-50 bg-white mb-10 mx-auto max-w-lg relative group">
            <img src={productData.images[0]} className="w-full h-full object-contain p-6" />
            <div className="absolute top-6 left-6 bg-pink-500 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase shadow-lg">Premium Quality</div>
          </div>

          <div className="flex flex-col items-center gap-2 mb-12">
            <span className="text-slate-400 line-through text-xl font-bold">{productData.originalPrice.toLocaleString()} د.ج</span>
            <div className="bg-pink-50 text-pink-600 px-8 py-4 rounded-3xl border border-pink-100">
               <span className="text-5xl font-black">{productData.currentPrice.toLocaleString()}</span>
               <span className="text-sm font-bold mr-2 uppercase">د.ج / DA</span>
            </div>
            <div className="mt-4 flex items-center gap-2 bg-emerald-50 text-emerald-700 px-6 py-2 rounded-full text-xs font-black border border-emerald-100 uppercase tracking-tighter">
                <ShieldCheck size={16} /> الدفع عند الاستلام / Paiement à la livraison
            </div>
          </div>
        </section>

        {/* Long Informational Blocks */}
        <div className="space-y-32 pb-32">
          {productData.features.map((feature, i) => {
            const Icon = ICON_MAP[feature.icon] || Star;
            return (
              <section key={i} className="px-4">
                <div className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-16`}>
                  <div className="flex-1 space-y-8 text-center md:text-right">
                    <div className="inline-flex p-4 rounded-3xl bg-pink-50 text-pink-500 shadow-sm">
                      {Icon && typeof Icon !== 'string' ? <Icon size={40} /> : <Star size={40} />}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">{feature.title}</h2>
                  <p className="text-slate-600 text-xl leading-relaxed font-medium md:max-w-md">{feature.desc}</p>
                  <div className="h-2 w-20 bg-pink-500 rounded-full mx-auto md:mx-0" />
                </div>
                <div className="flex-1 w-full max-w-md">
                   <div className="aspect-[16/9] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-50 relative group">
                      <img src={feature.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                   </div>
                </div>
              </div>
              </section>
            );
          })}
        </div>

        {/* Feature Highlights Banner */}
        <section className="px-4 py-24 bg-slate-900 text-white rounded-[4rem] mx-4 mb-32 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <h2 className="text-4xl font-black text-center mb-16 relative">لماذا تختار Ninja HyperHeat؟</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative">
                {productData.stats.map((stat, i) => (
                    <div key={i} className="text-center space-y-2">
                        <div className="text-3xl font-black text-pink-400 uppercase">{stat.val}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.lab}</div>
                    </div>
                ))}
            </div>
        </section>

        {/* Full Screen Image Gallery */}
        <section className="px-4 py-10 bg-slate-50/50 rounded-[4rem] mb-32 border border-slate-100">
          <h2 className="text-3xl font-black text-center mb-16 uppercase tracking-tighter">معرض الصور / Galerie d'Images</h2>
          <div className="max-w-3xl mx-auto">
            <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl mb-8 bg-white group touch-none border-8 border-white">
                <motion.div className="flex h-full" drag="x" dragConstraints={{ left: 0, right: 0 }} onDragEnd={(_, info) => { if (info.offset.x > 50) setActiveImgIndex(prev => (prev > 0 ? prev - 1 : productData.images.length - 1)); else if (info.offset.x < -50) setActiveImgIndex(prev => (prev < productData.images.length - 1 ? prev + 1 : 0)); }}>
                <AnimatePresence mode="wait"><motion.img key={activeImgIndex} src={productData.images[activeImgIndex]} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="w-full h-full object-contain pointer-events-none p-6" /></AnimatePresence>
                </motion.div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">{productData.images.map((_, i) => (<div key={i} className={`h-1.5 rounded-full transition-all ${activeImgIndex === i ? 'w-8 bg-pink-500' : 'w-2 bg-slate-200'}`} />))}</div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar justify-center px-4">{productData.images.map((img, i) => (<button key={i} onClick={() => setActiveImgIndex(i)} className={`w-20 h-20 rounded-2xl overflow-hidden border-4 transition-all shrink-0 bg-white flex items-center justify-center p-1 shadow-sm ${activeImgIndex === i ? 'border-pink-500 scale-110 shadow-pink-100' : 'border-transparent opacity-60'}`}><img src={img} className="max-w-full max-h-full object-contain" /></button>))}</div>
          </div>
        </section>

        {/* Order Form Container */}
        <section id="order-form" className="px-4 pb-40">
          <div className="bg-[#FFF1F2] border-[6px] border-white rounded-[4rem] p-6 md:p-16 relative overflow-hidden shadow-2xl shadow-pink-100/50">
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-pink-300/10 rounded-full blur-3xl" />
            <div className="text-center mb-16 relative">
              <div className="inline-flex items-center gap-2 bg-pink-500 text-white px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-xl shadow-pink-200">Order Form / طلب شراء</div>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">إملأ الاستمارة للطلب</h2>
              <p className="text-slate-500 font-bold text-lg">التوصيل متوفر لجميع الولايات - الدفع عند الاستلام</p>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-10 relative max-w-2xl mx-auto">
              <div className="space-y-4"><label className="text-xs font-black text-slate-500 flex items-center gap-2 uppercase tracking-widest">الاسم واللقب / Nom & Prénom *</label><input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Mohamed Ali" className="w-full px-8 py-6 bg-white border border-pink-50 rounded-3xl focus:ring-[12px] focus:ring-pink-500/10 outline-none text-xl font-bold shadow-sm transition-all" /></div>
              <div className="space-y-4"><label className="text-xs font-black text-slate-500 flex items-center gap-2 uppercase tracking-widest">رقم الهاتف / Téléphone *</label><input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="06XXXXXXXX" className="w-full px-8 py-6 bg-white border border-pink-50 rounded-3xl focus:ring-[12px] focus:ring-pink-500/10 outline-none text-xl font-mono font-bold shadow-sm transition-all" dir="ltr" /></div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4"><label className="text-xs font-black text-slate-500 uppercase tracking-widest">الولاية / Wilaya *</label><select required value={formData.wilaya} onChange={e => setFormData({...formData, wilaya: e.target.value})} className="w-full px-8 py-6 bg-white border border-pink-50 rounded-3xl focus:ring-[12px] focus:ring-pink-500/10 outline-none font-bold text-xl cursor-pointer shadow-sm"><option value="" disabled>-- Choisir Wilaya --</option>{WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}</select></div>
                <div className="space-y-4"><label className="text-xs font-black text-slate-500 uppercase tracking-widest">البلدية / Commune *</label><input type="text" required value={formData.commune} onChange={e => setFormData({...formData, commune: e.target.value})} placeholder="Commune" className="w-full px-8 py-6 bg-white border border-pink-50 rounded-3xl focus:ring-[12px] focus:ring-pink-500/10 outline-none font-bold text-xl shadow-sm" /></div>
              </div>

              <div className="space-y-6">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">نوع التوصيل / Livraison *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button type="button" onClick={() => setFormData({...formData, deliveryType: 'office'})} className={`flex items-center justify-between p-8 rounded-[2rem] border-[3px] transition-all ${formData.deliveryType === 'office' ? 'border-pink-500 bg-white shadow-2xl shadow-pink-100' : 'border-white bg-white/40 opacity-60 grayscale'}`}>
                    <div className="flex items-center gap-6 text-right"><Building size={32} className={formData.deliveryType === 'office' ? 'text-pink-500' : ''} /><div><div className="font-black text-xl text-slate-900 leading-none mb-1">المكتب / Bureau</div><div className="text-[10px] font-bold uppercase tracking-widest">Récupérer au bureau</div></div></div>
                    <div className="font-black text-2xl text-pink-600 tabular-nums">700<span className="text-[10px] mr-1">دج</span></div>
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, deliveryType: 'home'})} className={`flex items-center justify-between p-8 rounded-[2rem] border-[3px] transition-all ${formData.deliveryType === 'home' ? 'border-pink-500 bg-white shadow-2xl shadow-pink-100' : 'border-white bg-white/40 opacity-60 grayscale'}`}>
                    <div className="flex items-center gap-6 text-right"><Home size={32} className={formData.deliveryType === 'home' ? 'text-pink-500' : ''} /><div><div className="font-black text-xl text-slate-900 leading-none mb-1">المنزل / Domicile</div><div className="text-[10px] font-bold uppercase tracking-widest">Livraison à domicile</div></div></div>
                    <div className="font-black text-2xl text-pink-600 tabular-nums">1000<span className="text-[10px] mr-1">دج</span></div>
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center py-8"><label className="text-2xl font-black text-slate-900 uppercase">الكمية / Qty:</label><div className="flex items-center gap-8 bg-white px-8 py-4 rounded-[2.5rem] border-2 border-pink-50 shadow-xl shadow-pink-100/20"><button type="button" onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})} className="w-14 h-14 flex items-center justify-center bg-slate-50 rounded-2xl text-3xl font-black transition-all hover:bg-slate-100 active:scale-90">-</button><span className="w-12 text-center font-black text-4xl tabular-nums">{formData.quantity}</span><button type="button" onClick={() => setFormData({...formData, quantity: formData.quantity + 1})} className="w-14 h-14 flex items-center justify-center bg-slate-50 rounded-2xl text-3xl font-black transition-all hover:bg-slate-100 active:scale-90">+</button></div></div>

              <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full bg-pink-500 opacity-0 group-hover:opacity-[0.02] transition-opacity duration-1000" />
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-slate-400">سعر المنتج / Prix Unit.</span>
                  <span className="font-black text-2xl tabular-nums">{(formData.quantity * productData.currentPrice).toLocaleString()} <span className="text-xs uppercase ml-1">دج</span></span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-slate-400">التوصيل / Livraison</span>
                  <span className="font-black text-pink-400 text-2xl tabular-nums">+{ (formData.deliveryType === 'home' ? SHIPPING_HOME : SHIPPING_OFFICE).toLocaleString() } <span className="text-xs uppercase ml-1">دج</span></span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between items-center">
                  <div className="flex flex-col"><span className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-500 mb-1">Grand Total</span><span className="text-2xl font-black">المجموع الكلي</span></div>
                  <span className="text-5xl font-black text-pink-500 tabular-nums tracking-tighter">{((formData.quantity * productData.currentPrice) + (formData.deliveryType === 'home' ? SHIPPING_HOME : SHIPPING_OFFICE)).toLocaleString()} <span className="text-base uppercase">دج</span></span>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-pink-300 transition-all active:scale-[0.98] hover:-translate-y-1 flex items-center justify-center gap-3 uppercase group">
                {isSubmitting ? <div className="w-6 h-6 border-[4px] border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle size={20} className="group-hover:scale-110 transition-transform" /> تأكيد الطلب / Valider</>}
              </button>
            </form>

            <AnimatePresence>{isSuccess && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="mt-16 p-12 bg-emerald-500 text-white rounded-[4rem] text-center shadow-2xl relative z-10"><CheckCircle size={80} className="mx-auto mb-8 animate-bounce" /><h4 className="text-4xl font-black mb-4 uppercase">Success / مبروك!</h4><p className="text-xl font-bold opacity-95">تم إستقبال طلبك بنجاح. سيتصل بك فريقنا قريباً جداً هاتفياً لتأكيد الشحن.</p></motion.div>)}</AnimatePresence>
          </div>
        </section>

        <footer className="px-4 py-32 border-t border-slate-100 text-center space-y-10">
          <button onClick={() => setShowAdminLogin(true)} className="text-4xl font-black text-slate-900 uppercase tracking-tighter hover:opacity-80 transition-opacity outline-none focus:outline-none"><span className="text-pink-500">{productData.siteName}</span></button>
          <div className="flex justify-center gap-8 text-slate-400">
             <div className="flex flex-col items-center gap-2"><Truck size={24} /><span className="text-[10px] font-black uppercase">Rapid Shipping</span></div>
             <div className="flex flex-col items-center gap-2"><ShieldCheck size={24} /><span className="text-[10px] font-black uppercase">Original Warranty</span></div>
             <div className="flex flex-col items-center gap-2"><Sparkles size={24} /><span className="text-[10px] font-black uppercase">Premium Support</span></div>
          </div>
          <p className="text-slate-400 font-bold max-w-sm mx-auto leading-relaxed">بوابتك لأفضل أدوات المطبخ العالمية في الجزائر. جودة أصلية وتوصيل سريع لباب الدار.</p>
          <div className="pt-20 opacity-30 hover:opacity-100 transition-opacity"><button onClick={() => setShowAdminLogin(true)} className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-500">Internal Administration Control</button></div>
        </footer>

      </main>

      {/* Persistent Sticky Order Button */}
      <div className="fixed bottom-10 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <motion.button 
            initial={{ y: 100 }} animate={{ y: 0 }}
            onClick={scrollToForm}
            className="pointer-events-auto bg-pink-500 text-white px-6 py-3 rounded-xl font-black text-sm shadow-xl shadow-pink-400/30 active:scale-95 transition-all flex items-center gap-2 hover:bg-pink-600 border-2 border-white"
        >
            <ShoppingCart size={16} />
            أطلب الآن / Commander
            <ChevronLeft size={16} />
        </motion.button>
      </div>

    </div>
  );
}
