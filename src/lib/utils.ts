export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('tr-TR');
};

export const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('tr-TR');
};

export const militaryStatusOptions = [
  'Yapıldı',
  'Yapılmadı',
  'Muaf',
  'Tecilli',
];

export const educationOptions = [
  'İlköğretim',
  'Lise',
  'Ön Lisans',
  'Lisans',
  'Yüksek Lisans',
  'Doktora',
];

export const applicationSourceOptions = [
  'Kariyer.net',
  'LinkedIn',
  'Şirket Web Sitesi',
  'Referans',
  'Diğer',
];

export const negativeReasonOptions = [
  'Tecrübe Yetersizliği',
  'Ücret Beklentisi',
  'Teknik Yetersizlik',
  'İletişim Becerileri',
  'Diğer',
];