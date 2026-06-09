/**
 * src/i18n/index.ts
 * Sprint 3 [Mohab] — AFA Week XII: Internationalization (i18n)
 */
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

const resources = {
  en: { translation: {
    nav: { home:'Home', facilities:'Facilities', bookings:'My Bookings', login:'Login', register:'Register', logout:'Logout' },
    home: { hero_title:'Book Your Sport Facility', hero_subtitle:'Find and reserve the perfect facility', cta:'Browse Facilities', available_now:'Available Now', feat_easy_title:'Easy Booking', feat_easy_desc:'Book in minutes, no paperwork', feat_secure_title:'Secure Payments', feat_secure_desc:'Stripe-powered transactions', feat_realtime_title:'Real-time Availability', feat_realtime_desc:'Always up-to-date schedules' },
    facilities: { title:'Facilities', search:'Search facilities…', filter_all:'All', filter_available:'Available Only', filter_indoor:'Indoor', filter_outdoor:'Outdoor', capacity:'Capacity', rate:'Rate', per_hour:'/hr', book_now:'Book Now', no_results:'No facilities found', status_available:'Available', status_booked:'Booked', status_maintenance:'Maintenance', status_closed:'Closed' },
    booking: { title:'Book Facility', start_time:'Start Time', end_time:'End Time', notes:'Notes (optional)', total:'Total', confirm:'Confirm Booking', cancel:'Cancel Booking', pay_now:'Pay Now', my_bookings:'My Bookings', status_pending:'Pending', status_confirmed:'Confirmed', status_cancelled:'Cancelled', status_completed:'Completed', no_bookings:'No bookings yet', success:'Booking created successfully!' },
    auth: { login_title:'Sign In', register_title:'Create Account', username:'Username', email:'Email', password:'Password', first_name:'First Name', last_name:'Last Name', phone:'Phone', login_btn:'Sign In', register_btn:'Create Account', no_account:"Don't have an account?", have_account:'Already have an account?', google_login:'Continue with Google', or:'or' },
    common: { loading:'Loading…', error:'Something went wrong', retry:'Retry', save:'Save', cancel:'Cancel', delete:'Delete', edit:'Edit', back:'Back', close:'Close' },
    theme: { light:'Light Mode', dark:'Dark Mode' },
    lang: { en:'English', pl:'Polish', ar:'Arabic' },
  }},
  pl: { translation: {
    nav: { home:'Strona główna', facilities:'Obiekty', bookings:'Moje rezerwacje', login:'Zaloguj', register:'Rejestracja', logout:'Wyloguj' },
    home: { hero_title:'Zarezerwuj obiekt sportowy', hero_subtitle:'Znajdź i zarezerwuj idealny obiekt', cta:'Przeglądaj obiekty', available_now:'Dostępne teraz', feat_easy_title:'Łatwa rezerwacja', feat_easy_desc:'Rezerwuj w minutę, bez formalności', feat_secure_title:'Bezpieczne płatności', feat_secure_desc:'Transakcje obsługiwane przez Stripe', feat_realtime_title:'Dostępność na żywo', feat_realtime_desc:'Zawsze aktualne harmonogramy' },
    facilities: { title:'Obiekty', search:'Szukaj obiektów…', filter_all:'Wszystkie', filter_available:'Tylko dostępne', filter_indoor:'Hala', filter_outdoor:'Zewnętrzne', capacity:'Pojemność', rate:'Stawka', per_hour:'/godz.', book_now:'Zarezerwuj', no_results:'Nie znaleziono obiektów', status_available:'Dostępny', status_booked:'Zajęty', status_maintenance:'Konserwacja', status_closed:'Zamknięty' },
    booking: { title:'Rezerwacja', start_time:'Czas rozpoczęcia', end_time:'Czas zakończenia', notes:'Uwagi (opcjonalnie)', total:'Łącznie', confirm:'Potwierdź rezerwację', cancel:'Anuluj rezerwację', pay_now:'Zapłać teraz', my_bookings:'Moje rezerwacje', status_pending:'Oczekuje', status_confirmed:'Potwierdzona', status_cancelled:'Anulowana', status_completed:'Zakończona', no_bookings:'Brak rezerwacji', success:'Rezerwacja utworzona!' },
    auth: { login_title:'Zaloguj się', register_title:'Utwórz konto', username:'Nazwa użytkownika', email:'Email', password:'Hasło', first_name:'Imię', last_name:'Nazwisko', phone:'Telefon', login_btn:'Zaloguj', register_btn:'Utwórz konto', no_account:'Nie masz konta?', have_account:'Masz już konto?', google_login:'Kontynuuj z Google', or:'lub' },
    common: { loading:'Ładowanie…', error:'Coś poszło nie tak', retry:'Spróbuj ponownie', save:'Zapisz', cancel:'Anuluj', delete:'Usuń', edit:'Edytuj', back:'Wstecz', close:'Zamknij' },
    theme: { light:'Tryb jasny', dark:'Tryb ciemny' },
    lang: { en:'Angielski', pl:'Polski', ar:'Arabski' },
  }},
  ar: { translation: {
    nav: { home:'الرئيسية', facilities:'المرافق', bookings:'حجوزاتي', login:'تسجيل الدخول', register:'إنشاء حساب', logout:'تسجيل الخروج' },
    home: { hero_title:'احجز منشأتك الرياضية', hero_subtitle:'ابحث واحجز المنشأة المثالية', cta:'تصفح المرافق', available_now:'متاح الآن', feat_easy_title:'حجز سهل', feat_easy_desc:'احجز في دقائق، بدون أوراق', feat_secure_title:'مدفوعات آمنة', feat_secure_desc:'معاملات عبر Stripe', feat_realtime_title:'توفر فوري', feat_realtime_desc:'جداول محدثة دائمًا' },
    facilities: { title:'المرافق', search:'ابحث عن المرافق…', filter_all:'الكل', filter_available:'المتاحة فقط', filter_indoor:'داخلي', filter_outdoor:'خارجي', capacity:'السعة', rate:'السعر', per_hour:'/ساعة', book_now:'احجز الآن', no_results:'لا توجد مرافق', status_available:'متاح', status_booked:'محجوز', status_maintenance:'صيانة', status_closed:'مغلق' },
    booking: { title:'حجز المنشأة', start_time:'وقت البدء', end_time:'وقت الانتهاء', notes:'ملاحظات', total:'الإجمالي', confirm:'تأكيد الحجز', cancel:'إلغاء الحجز', pay_now:'ادفع الآن', my_bookings:'حجوزاتي', status_pending:'قيد الانتظار', status_confirmed:'مؤكد', status_cancelled:'ملغى', status_completed:'مكتمل', no_bookings:'لا توجد حجوزات', success:'تم إنشاء الحجز!' },
    auth: { login_title:'تسجيل الدخول', register_title:'إنشاء حساب', username:'اسم المستخدم', email:'البريد الإلكتروني', password:'كلمة المرور', first_name:'الاسم الأول', last_name:'اسم العائلة', phone:'الهاتف', login_btn:'دخول', register_btn:'إنشاء حساب', no_account:'ليس لديك حساب؟', have_account:'لديك حساب؟', google_login:'المتابعة مع Google', or:'أو' },
    common: { loading:'جاري التحميل…', error:'حدث خطأ', retry:'إعادة المحاولة', save:'حفظ', cancel:'إلغاء', delete:'حذف', edit:'تعديل', back:'رجوع', close:'إغلاق' },
    theme: { light:'الوضع الفاتح', dark:'الوضع الداكن' },
    lang: { en:'الإنجليزية', pl:'البولندية', ar:'العربية' },
  }},
}

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources, fallbackLng: 'en',
  interpolation: { escapeValue: false },
  detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'], lookupLocalStorage: 'sfbs_lang' },
})

export default i18n