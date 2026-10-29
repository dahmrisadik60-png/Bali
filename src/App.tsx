/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  ShoppingCart, CheckCircle, Package, Truck, ShieldCheck, 
  Star, LogOut, Trash2, Edit3, Save, Image as ImageIcon,
  ChevronLeft, ChevronRight, Phone, MapPin, Eye, Clock, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface Order {
  id: string;
  name: string;
  phone: string;
  wilaya: string;
  commune: string;
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
  features: string[];
  mainImageIndex: number;
}

// --- Constants ---
const WILAYAS = [
  "01 - Adrar", "02 - Chlef", "03 - Laghouat", "04 - Oum El Bouaghi", "05 - Batna", 
  "06 - Béjaïa", "07 - Biskra", "08 - Béchar", "09 - Blida", "10 - Bouira", 
  "11 - Tamanrasset", "12 - Tébessa", "13 - Tlemcen", "14 - Tiaret", "15 - Tizi Ouzou", 
  "16 - Alger", "17 - Djelfa", "18 - Jijel", "19 - Sétif", "20 - Saïda", 
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
  name: "طباخ نينجا الهايدروباور الكهربائي 9 في 1 (Ninja HyperHeat PC201GY)",
  originalPrice: 69000,
  currentPrice: 67000,
  discount: "-3%",
  images: [
    "/src/assets/images/ninja_hyperheat_hero_1793292196156.jpg",
    "/src/assets/images/ninja_hyperheat_detail_1793292209515.jpg",
    "/public/assets/aistudio/Screenshot_20261029_174154_Google_f7627622.jpg"
  ],
  features: [
    "طهي أسرع مرتين بالبخار والطهي السريع بالضغط",
    "سعة عائلية ضخمة 6.5 لتر: يكفي لإعداد وجبات كاملة حتى 10 أشخاص.",
    "9 وظائف في جهاز واحد: (ضغط، أرز، بخار، طهي بطيء، القلي السريع، زبادي...)",
    "صحية وآمنة 100%: وعاء غير لاصق من السيراميك الخالي تماماً من المواد الضارة."
  ],
  mainImageIndex: 0
};

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [productData, setProductData] = useState<ProductData>(DEFAULT_PRODUCT);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    wilaya: '',
    commune: '',
    quantity: 1
  });

  // Gallery Index
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Admin Editing State
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<ProductData>(productData);

  useEffect(() => {
    const savedOrders = localStorage.getItem('roza_beauty_orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));

    const savedProduct = localStorage.getItem('roza_beauty_product');
    if (savedProduct) {
        const parsed = JSON.parse(savedProduct);
        setProductData(parsed);
        setEditData(parsed);
    }

    // Global error listener for images to handle broken paths
    const handleError = (e: ErrorEvent) => {
      if (e.target instanceof HTMLImageElement) {
        console.error("فشل تحميل الصورة:", e.target.src);
        e.target.src = "https://placehold.co/600x400?text=Image+Not+Found";
      }
    };
    window.addEventListener('error', handleError, true);
    return () => window.removeEventListener('error', handleError, true);
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '2009') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setPassword('');
    } else {
      alert('كلمة المرور خاطئة');
    }
  };

  const handleSaveProduct = () => {
    setProductData(editData);
    localStorage.setItem('roza_beauty_product', JSON.stringify(editData));
    setEditMode(false);
    alert('تم حفظ التغييرات بنجاح');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setEditData(prev => ({
          ...prev,
          images: [...prev.images, base64String]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setEditData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.wilaya) {
      alert('يرجى اختيار الولاية');
      return;
    }
    
    setIsSubmitting(true);
    
    const newOrder: Order = {
      id: Date.now().toString(),
      ...formData,
      total: formData.quantity * productData.currentPrice,
      date: new Date().toLocaleString('ar-DZ')
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('roza_beauty_orders', JSON.stringify(updatedOrders));

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', phone: '', wilaya: '', commune: '', quantity: 1 });
      setTimeout(() => setIsSuccess(false), 5000);
    }, 1500);
  };

  const deleteOrder = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      const updatedOrders = orders.filter(o => o.id !== id);
      setOrders(updatedOrders);
      localStorage.setItem('roza_beauty_orders', JSON.stringify(updatedOrders));
    }
  };

  const scrollToForm = () => {
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans" dir="rtl">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">لوحة التحكم</h1>
              <p className="text-slate-500 text-sm">ROZAKITCHENDZ - إدارة الطلبات</p>
              <div className="flex gap-4 mt-2">
                <button 
                  onClick={() => setEditMode(!editMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${editMode ? 'bg-pink-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  <Edit3 size={18} />
                  تعديل الصفحة / Modifier
                </button>
                <button 
                  onClick={() => {
                    if (confirm('سيتم مسح جميع البيانات والإعدادات والعودة للوضع الافتراضي. هل أنت متأكد؟')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  <Trash2 size={18} />
                  إعادة ضبط / Reset
                </button>
              </div>
            </div>
            <button 
              onClick={() => setIsAdmin(false)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
            >
              <LogOut size={18} />
              خروج
            </button>
          </header>

          {editMode ? (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 space-y-8 mb-10">
              <h2 className="text-xl font-bold border-b pb-4">تعديل بيانات المنتج</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="block text-sm font-bold">اسم المنتج</label>
                  <input 
                    type="text" 
                    value={editData.name}
                    onChange={e => setEditData({...editData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200"
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-bold">نسبة التخفيض (مثلاً: -3%)</label>
                  <input 
                    type="text" 
                    value={editData.discount}
                    onChange={e => setEditData({...editData, discount: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200"
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-bold">السعر الأصلي</label>
                  <input 
                    type="number" 
                    value={editData.originalPrice}
                    onChange={e => setEditData({...editData, originalPrice: Number(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-bold">السعر الحالي</label>
                  <input 
                    type="number" 
                    value={editData.currentPrice}
                    onChange={e => setEditData({...editData, currentPrice: Number(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-bold">ألبوم الصور</label>
                  <button 
                    onClick={() => setEditData({...editData, images: []})}
                    className="text-xs text-red-500 font-bold hover:underline"
                  >
                    مسح جميع الصور
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 border-2 border-dashed border-slate-200 p-4 rounded-2xl bg-slate-50">
                  {editData.images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm flex items-center justify-center p-1">
                      <img src={img} className="max-w-full max-h-full object-contain" />
                      <button 
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-7 h-7 bg-red-600/90 text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all z-10"
                        title="حذف الصورة"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white hover:border-blue-400 transition-all text-slate-400 hover:text-pink-500">
                    <ImageIcon size={24} />
                    <span className="text-[10px] font-bold">رفع صورة</span>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  * ملاحظة: يفضل استخدام روابط خارجية للصور إذا كان العدد كبيراً لتجنب بطء الصفحة.
                </p>
                <textarea 
                  rows={2}
                  value={editData.images.filter(img => img.startsWith('http')).join('\n')}
                  onChange={e => {
                    const localImages = editData.images.filter(img => !img.startsWith('http'));
                    const externalImages = e.target.value.split('\n').filter(s => s.trim());
                    setEditData({...editData, images: [...localImages, ...externalImages]});
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 font-mono text-xs mt-4"
                  placeholder="أو أضف روابط خارجية هنا (رابط واحد في كل سطر)"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold">المميزات (ميزة واحدة في كل سطر)</label>
                <textarea 
                  rows={4}
                  value={editData.features.join('\n')}
                  onChange={e => setEditData({...editData, features: e.target.value.split('\n').filter(s => s.trim())})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button 
                  onClick={() => setEditMode(false)}
                  className="px-8 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button 
                  onClick={handleSaveProduct}
                  className="px-8 py-3 bg-pink-600 text-white rounded-xl font-bold flex items-center gap-2"
                >
                  <Save size={20} />
                  حفظ البيانات
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">قائمة الطلبات</h2>
                <div className="bg-pink-50 text-blue-700 px-4 py-1 rounded-full text-xs font-bold">
                  إجمالي الطلبات: {orders.length}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">التاريخ</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">الاسم واللقب</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">الهاتف</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">الولاية / البلدية</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">الكمية</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">المجموع</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400">لا توجد طلبات حالياً</td>
                      </tr>
                    ) : (
                      orders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-xs text-slate-500 font-mono">{order.date}</td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900">{order.name}</td>
                          <td className="px-6 py-4 text-sm text-slate-700 font-mono">{order.phone}</td>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            {order.wilaya} <br/>
                            <span className="text-xs text-slate-400">{order.commune}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">{order.quantity}</td>
                          <td className="px-6 py-4 text-sm font-bold text-pink-600">{order.total.toLocaleString()} د.ج</td>
                          <td className="px-6 py-4 text-sm">
                            <button 
                              onClick={() => deleteOrder(order.id)}
                              className="p-2 text-red-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-pink-100" dir="rtl">
      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdminLogin(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm">
              <h3 className="text-xl font-bold mb-4 text-center">الدخول للمسؤول</h3>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pink-500 outline-none transition-all" autoFocus />
                <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95">دخول</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-slate-900 text-white py-2 px-4 overflow-hidden whitespace-nowrap">
        <div className="flex justify-center items-center gap-8 text-[10px] md:text-xs font-bold tracking-wider">
          <span className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-400" /> منتج أصلي 100% / Produit 100% Original</span>
          <span className="text-slate-600">▪</span>
          <span className="flex items-center gap-2"><Truck size={14} className="text-pink-400" /> توصيل لـ 69 ولاية / Livraison 69 Wilayas</span>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white px-4 py-4 sticky top-0 z-40 shadow-sm border-b border-slate-100">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button 
            onClick={() => setShowAdminLogin(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
          >
            <ShieldCheck size={16} />
            لوحة التحكم / Administration
          </button>
          <div className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 uppercase">
            <span className="text-pink-500">ROZAKITCHENDZ</span> DZ
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto pb-32">
        
        {/* Hero Card */}
        <section className="px-4 pt-6">
          <div className="bg-white rounded-[2.5rem] p-4 shadow-xl shadow-slate-200/50 border border-slate-100 relative">
            
            {/* Gallery Slider */}
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-slate-50 mb-6 group touch-none">
                <motion.div 
                    className="flex h-full"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(_, info) => {
                        const swipeThreshold = 50;
                        if (info.offset.x > swipeThreshold) {
                            setActiveImgIndex(prev => (prev > 0 ? prev - 1 : productData.images.length - 1));
                        } else if (info.offset.x < -swipeThreshold) {
                            setActiveImgIndex(prev => (prev < productData.images.length - 1 ? prev + 1 : 0));
                        }
                    }}
                >
                    <AnimatePresence mode="wait">
                        <motion.img 
                            key={activeImgIndex}
                            src={productData.images[activeImgIndex]} 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full object-contain pointer-events-none p-2"
                        />
                    </AnimatePresence>
                </motion.div>
                
                {/* Badges */}
                <div className="absolute top-4 right-4 z-10 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                    تخفيض حصري / Promo {productData.discount}
                </div>
                <div className="absolute bottom-4 left-4 z-10 bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold px-4 py-1 rounded-full border border-white/20">
                    الدفعة الأخيرة متوفرة / Stock limité
                </div>

                {/* Arrows (Hidden on small mobile, visible on hover) */}
                <button 
                    onClick={() => setActiveImgIndex((prev) => (prev > 0 ? prev - 1 : productData.images.length - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/70 backdrop-blur rounded-full hidden md:flex items-center justify-center text-slate-900 hover:bg-white transition-all z-20"
                >
                    <ChevronLeft size={24} />
                </button>
                <button 
                    onClick={() => setActiveImgIndex((prev) => (prev < productData.images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/70 backdrop-blur rounded-full hidden md:flex items-center justify-center text-slate-900 hover:bg-white transition-all z-20"
                >
                    <ChevronRight size={24} />
                </button>

                {/* Dots indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {productData.images.map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all ${activeImgIndex === i ? 'w-6 bg-pink-500' : 'w-1.5 bg-white/50'}`} />
                    ))}
                </div>
            </div>

            {/* Thumbnails (Horizontal Scroll) */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-4 px-1 no-scrollbar scroll-smooth">
                {productData.images.map((img, i) => (
                    <button 
                        key={i} 
                        id={`thumb-${i}`}
                        onClick={() => setActiveImgIndex(i)}
                        className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 shadow-sm bg-white flex items-center justify-center p-1 ${activeImgIndex === i ? 'border-pink-500 scale-105 shadow-pink-100' : 'border-transparent opacity-60'}`}
                    >
                        <img src={img} className="max-w-full max-h-full object-contain" />
                    </button>
                ))}
            </div>

            {/* Product Title & Pricing */}
            <div className="px-2 space-y-4 text-center">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                {productData.name}
              </h1>
              
              <div className="flex items-center justify-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-slate-400 line-through text-sm">{productData.originalPrice.toLocaleString()} د.ج / DA</span>
                  <div className="flex items-baseline gap-1 text-3xl font-black text-emerald-600">
                    <span>{productData.currentPrice.toLocaleString()}</span>
                    <span className="text-sm">د.ج / DA</span>
                  </div>
                </div>
              </div>

              <div className="inline-block bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black border border-emerald-100 uppercase tracking-tighter">
                الدفع عند الاستلام / Paiement à la livraison
              </div>
            </div>
          </div>
        </section>

        {/* Features List */}
        <section className="px-4 py-10">
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-100">
            <h2 className="text-xl font-black mb-6 flex items-center gap-3">
              <Star className="text-pink-500 fill-pink-500" size={24} />
              خصائص المنتج الأساسية / Caractéristiques:
            </h2>
            <ul className="space-y-4">
              {productData.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl group transition-all hover:bg-emerald-50/50">
                  <div className="mt-1 w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle size={14} />
                  </div>
                  <p className="text-sm md:text-base font-bold text-slate-700 leading-relaxed">{feature}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Order Form Container */}
        <section id="order-form" className="px-4 py-4">
          <div className="bg-[#EC4899]/5 border-2 border-[#EC4899] rounded-[3rem] p-6 md:p-10">
            <div className="text-center mb-10">
              <div className="inline-block bg-[#EC4899] text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">أطلب الآن / Commander</div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">إملأ الاستمارة للطلب / Remplissez le formulaire</h2>
              <p className="text-slate-500 text-[10px] mt-2">التوصيل متوفر لجميع الولايات - الدفع عند الاستلام / Livraison 58 Wilayas</p>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-tighter">الاسم واللقب / Nom et Prénom <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Mohamed Ali"
                  className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-pink-100 outline-none transition-all placeholder:text-slate-300 text-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-tighter">رقم الهاتف / Numéro de téléphone <span className="text-red-500">*</span></label>
                <input 
                  type="tel" 
                  required
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  placeholder="06XXXXXXXX"
                  className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-pink-100 outline-none transition-all placeholder:text-slate-300 text-lg font-mono text-left"
                  dir="ltr"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-tighter">الولاية / Wilaya <span className="text-red-500">*</span></label>
                  <select 
                    required
                    value={formData.wilaya}
                    onChange={e => setFormData({...formData, wilaya: e.target.value})}
                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-pink-100 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>-- إختر الولاية / Choisir Wilaya --</option>
                    {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-tighter">البلدية / Commune <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={formData.commune}
                    onChange={e => setFormData({...formData, commune: e.target.value})}
                    placeholder="Ex: Alger / Oran"
                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-pink-100 outline-none transition-all placeholder:text-slate-300 text-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-slate-700">الكمية / Quantité:</label>
                    <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl border border-slate-200">
                        <button type="button" onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-900 rounded-xl hover:bg-slate-100 transition-colors font-bold border border-slate-200">-</button>
                        <span className="w-10 text-center font-black text-xl">{formData.quantity}</span>
                        <button type="button" onClick={() => setFormData({...formData, quantity: formData.quantity + 1})} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-900 rounded-xl hover:bg-slate-100 transition-colors font-bold border border-slate-200">+</button>
                    </div>
                </div>
              </div>

              {/* Price Calculation Box */}
              <div className="bg-[#FFF1F2] p-6 rounded-3xl border border-[#EC4899]/20 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-bold tracking-tighter">سعر المنتج / Prix:</span>
                  <span className="text-slate-900 font-mono">{(formData.quantity * productData.currentPrice).toLocaleString()} د.ج / DA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-bold tracking-tighter">التوصيل / Livraison:</span>
                  <span className="text-emerald-600 font-bold text-[10px] md:text-xs" translate="no">حسب الولاية / Livraison selon Wilaya</span>
                </div>
                <div className="h-px bg-[#EC4899]/20" />
                <div className="flex justify-between items-center">
                  <span className="text-sm md:text-base font-black text-slate-900 tracking-tighter">المبلغ الإجمالي التقريبي / Total:</span>
                  <span className="text-xl md:text-2xl font-black text-pink-600">{(formData.quantity * productData.currentPrice).toLocaleString()} د.ج / DA</span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-6 bg-pink-500 hover:bg-pink-600 text-white rounded-3xl font-black text-xl shadow-xl shadow-pink-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle size={28} />
                    تأكيد الطلب / Confirmer la commande
                  </>
                )}
              </button>
            </form>

            <AnimatePresence>
              {isSuccess && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-8 p-6 bg-emerald-500 text-white rounded-3xl flex flex-col items-center gap-2 text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle size={32} />
                  </div>
                  <h4 className="text-xl font-bold">تم إرسال طلبك بنجاح / Succès!</h4>
                  <p className="text-sm opacity-90">سيتواصل معك فريق خدمة العملاء قريباً / On vous contactera bientôt.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Footer Trust Section */}
        <section className="px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
                { title: "توصيل سريع / Rapide", desc: "69 ولاية / Wilayas", icon: Truck, bg: "bg-pink-50", text: "text-pink-600" },
                { title: "ضمان الجودة / Qualité", desc: "منتج أصلي / Original", icon: ShieldCheck, bg: "bg-emerald-50", text: "text-emerald-600" },
                { title: "الدفع بعد الرؤية", desc: "Paiement à la livraison", icon: Eye, bg: "bg-pink-50", text: "text-pink-600" }
            ].map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center shadow-sm">
                    <div className={`w-12 h-12 ${item.bg} ${item.text} rounded-2xl flex items-center justify-center mb-4`}>
                        <item.icon size={24} />
                    </div>
                    <h3 className="font-black text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                </div>
            ))}
        </section>

      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 py-4 flex items-center justify-between shadow-2xl safe-area-bottom">
        <div className="flex flex-col items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">السعر / Prix:</span>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-pink-600">{productData.currentPrice.toLocaleString()}</span>
                <span className="text-xs font-bold text-pink-400">د.ج / DA</span>
            </div>
        </div>
        <button 
            onClick={scrollToForm}
            className="bg-pink-500 text-white px-8 py-3.5 rounded-2xl font-black text-base shadow-lg shadow-pink-200 active:scale-95 transition-all flex items-center gap-2"
        >
            أطلب الآن / Commander
            <ChevronLeft size={20} />
        </button>
      </div>

    </div>
  );
}
