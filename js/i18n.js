/* Arabic / English interface.
   The Arabic text in the page and in t('...') calls is the key; EN holds the English for each one.
   %name placeholders are filled from the params object: t('%n طالب', { n: 5 }). */
(() => {
'use strict';
const EN = {
  // ---- page / top bar ----
  'مولّد الشهادات': 'Certificate Generator',
  '— شهادة لكل طالب، مرتبة حسب الصف': '— one certificate per student, sorted by class',
  'تراجع (Ctrl+Z)': 'Undo (Ctrl+Z)', 'إعادة (Ctrl+Y)': 'Redo (Ctrl+Y)', 'جولة تعريفية': 'Quick tour',
  'يحفظ الصورة والحقول والتنسيقات في ملف واحد لاستخدامه لاحقاً': 'Saves the image, fields and styles in one file to reuse later',
  'حفظ التصميم': 'Save design', 'فتح تصميم محفوظ سابقاً (.json)': 'Open a saved design (.json)', 'فتح تصميم': 'Open design',
  'توليد الشهادات': 'Generate certificates',
  // ---- setup panel ----
  'صورة الشهادة (القالب)': 'Certificate image (template)', 'قوالب جاهزة': 'Ready templates', 'تغيير': 'Change',
  'اسحب صورة الشهادة هنا': 'Drag the certificate image here', 'أو اضغط للاختيار — PNG / JPG': 'or click to choose — PNG / JPG',
  'المتغيرات (أسماء الحقول)': 'Variables (field names)',
  'اكتب اسم أي معلومة تريدها على الشهادة، وستُعبّأ لكل طالب من ملف Excel.': 'Type the name of any information you want on the certificate — it is filled in for each student from Excel.',
  'مثال: اسم الطالب': 'e.g. Student Name', 'إضافة': 'Add',
  'تحميل ملف Excel جاهز بهذه الأعمدة لتعبئته': 'Download a ready Excel file with these columns',
  'ملف Excel (بيانات الطلاب)': 'Excel file (student data)', 'عرض': 'View',
  'تحديث البيانات من Google Sheets': 'Refresh data from Google Sheets',
  'عمود الصف': 'Class column', '(تُقسَّم وتُرتَّب الشهادات حسبه)': '(certificates are grouped and sorted by it)',
  'ترتيب الطلاب داخل كل صف': 'Order of students within each class',
  'الصفوف الموجودة في الملف (بالترتيب):': 'Classes found in the file (in order):',
  'اسحب ملف Excel أو CSV هنا': 'Drag an Excel or CSV file here', 'الصف الأول في الملف = أسماء الأعمدة': 'First row of the file = column names',
  'أو من Google Sheets': 'or from Google Sheets', 'الصق رابط الجدول هنا': 'Paste the sheet link here', 'جلب': 'Fetch',
  'يجب أن يكون الجدول مُشاركاً: «مشاركة ← أي شخص لديه الرابط ← عارض». تُقرأ كل الأوراق.': 'The sheet must be shared: “Share → Anyone with the link → Viewer”. All tabs are read.',
  'تحميل ملف Excel نموذجي': 'Download a sample Excel file',
  'الحقول على الشهادة': 'Fields on the certificate', '+ نص': '+ Text',
  // ---- stage ----
  'معاينة:': 'Preview:', 'الطالب السابق': 'Previous student', 'الطالب التالي': 'Next student', 'حدود الحقول': 'Field outlines',
  'تصغير': 'Zoom out', 'تكبير': 'Zoom in', 'ملاءمة الشاشة': 'Fit to screen', 'ملاءمة': 'Fit',
  'تحميل الشهادة المعروضة حالياً كصورة': 'Download the certificate shown as an image', 'تحميل هذه الشهادة': 'Download this one',
  'ابدأ بصورة الشهادة': 'Start with your certificate image',
  'اسحب صورة الشهادة الفارغة إلى هنا، أو اختر قالباً جاهزاً': 'Drag your blank certificate image here, or pick a ready template',
  'اختيار صورة': 'Choose image', 'طريقة العمل:': 'How it works:',
  'أضف صورة الشهادة الفارغة، أو اختر قالباً جاهزاً.': 'Add your blank certificate image, or pick a ready template.',
  'أضف المتغيرات بأسماء من عندك (اسم الطالب، الصف، التقدير، ...) واسحبها لمكانها على الشهادة.': 'Add variables with your own names (Student Name, Class, Grade, ...) and drag them into place.',
  'ارفع ملف Excel — يُربط كل متغير بعموده تلقائياً، وتُعبّأ البيانات لكل طالب.': 'Upload an Excel file — each variable links to its column automatically and is filled in for every student.',
  'اختر الخط واللون والحجم من لوحة التنسيق.': 'Pick the font, color and size in the style panel.',
  'اضغط «توليد الشهادات» — تحصل على مجلد لكل صف.': 'Click “Generate certificates” — you get a folder per class.',
  'اسحب الحقل لتحريكه': 'Drag a field to move it', 'اسحب الزوايا لتكبير الخط': 'Drag the corners to resize',
  'الأسهم': 'Arrows', 'تحريك دقيق، مع': 'fine move, with', 'أثناء السحب لإلغاء المحاذاة التلقائية': 'while dragging to turn off snapping',
  'تراجع': 'undo', 'تكرار،': 'duplicate,', 'حذف': 'Delete',
  // ---- properties ----
  'اختر حقلاً من الشهادة أو من قائمة الحقول': 'Select a field on the certificate or in the field list',
  'لتعديل الخط واللون والموضع': 'to edit its font, color and position',
  'الحقل المحدد': 'Selected field', 'تكرار (Ctrl+D)': 'Duplicate (Ctrl+D)', 'حذف (Delete)': 'Delete (Delete)',
  'اسم الحقل': 'Field name', 'النص': 'Text', '— نص ثابت و/أو متغيرات من الملف': '— fixed text and/or variables from the file',
  'الخط': 'Font', 'نوع الخط': 'Typeface', 'الحجم': 'Size', 'السماكة': 'Weight',
  'خفيف': 'Light', 'عادي': 'Regular', 'متوسط': 'Medium', 'شبه عريض': 'Semibold', 'عريض': 'Bold', 'عريض جداً': 'Extra bold', 'أسود': 'Black',
  'محاذاة لليسار': 'Align left', 'توسيط': 'Center', 'محاذاة لليمين': 'Align right',
  'شكل الأرقام': 'Digits', 'كما في الملف': 'As in the file', 'عربية ١٢٣': 'Arabic ١٢٣', 'إنجليزية 123': 'Western 123',
  'تباعد الأسطر': 'Line spacing', 'خط مائل': 'Italic', '+ رفع خط من جهازك (TTF / OTF / WOFF)': '+ Upload your own font (TTF / OTF / WOFF)',
  'اللون': 'Color', 'التقاط لون من الشاشة/الشهادة': 'Pick a color from the screen',
  'الموضع والعرض': 'Position & width', 'أفقي (X)': 'Horizontal (X)', 'عمودي (Y)': 'Vertical (Y)',
  'توسيط أفقي': 'Center horizontally', 'توسيط عمودي': 'Center vertically',
  'أقصى عرض للنص': 'Max text width', '(بكسل، 0 = بلا حد)': '(pixels, 0 = no limit)',
  'إذا كان الاسم أطول من هذا العرض يُصغَّر الخط تلقائياً ليتسع (يظهر كإطار برتقالي).': 'If a name is longer than this width, the font shrinks automatically to fit (shown as an orange box).',
  'الشفافية': 'Opacity', 'تأثيرات': 'Effects', 'إطار حول الحروف': 'Text outline', 'ظل': 'Shadow', 'النعومة': 'Blur',
  // ---- footer / mobile ----
  'بياناتك لا تغادر جهازك — كل المعالجة تتم داخل متصفحك': 'Your data never leaves your device — everything runs in your browser',
  'كيف أستخدم الموقع؟': 'How does it work?',
  'الإعداد': 'Setup', 'الشهادة': 'Certificate', 'التنسيق': 'Style',
  // ---- dialogs ----
  'اختر تصميماً — يمكنك تعديل كل النصوص والخطوط والألوان بعدها': 'Pick a design — you can edit every text, font and color afterwards',
  'الصفوف المطلوب توليدها': 'Classes to generate', 'تحديد الكل': 'Select all', 'إلغاء الكل': 'Select none',
  'المخرجات': 'Output', 'صورة لكل طالب، داخل مجلد لكل صف': 'An image per student, in a folder per class',
  'صيغة الصورة': 'Image format', 'PNG — أعلى جودة': 'PNG — best quality', 'JPG — حجم أصغر': 'JPG — smaller files',
  'الدقة': 'Resolution', 'الأصلية (100%)': 'Original (100%)', 'اسم ملف الصورة': 'Image file name',
  '(يُضاف رقم الترتيب في البداية تلقائياً)': '(the order number is added at the start automatically)',
  'ملف PDF لكل صف (كل شهادة في صفحة — جاهز للطباعة)': 'A PDF per class (one certificate per page — print-ready)',
  'ملف PDF واحد يجمع كل الشهادات مرتبة حسب الصف': 'One PDF with all certificates, sorted by class',
  'تقسيم إضافي (اختياري)': 'Extra grouping (optional)',
  'مثلاً: اختر «اسم المعلم» ليصير لكل معلم مجلد، وبداخله مجلد لكل صف.': 'For example, choose “Teacher” to get a folder per teacher with a folder per class inside.',
  'إغلاق': 'Close', 'ابدأ التوليد وتحميل الملف': 'Generate and download',
  'بيانات الطلاب (بترتيب التوليد)': 'Student data (in generation order)',
  // ---- messages from the app ----
  'تعذر إنشاء الصورة': 'Could not create the image', 'بدون صف': 'No class', 'جميع الطلاب': 'All students', 'بدون': 'None',
  'تم التراجع': 'Undone', 'تمت الإعادة': 'Redone', '%w × %h بكسل': '%w × %h px', 'تعذر فتح الصورة': 'Could not open the image',
  'الرجاء اختيار صورة (PNG أو JPG). إذا كانت الشهادة PDF صدّرها كصورة أولاً.': 'Please choose an image (PNG or JPG). If your certificate is a PDF, export it as an image first.',
  'سيتم استبدال الصورة والحقول الحالية بالقالب. هل تريد المتابعة؟': 'This replaces the current image and fields with the template. Continue?',
  'جاري تجهيز القالب...': 'Preparing the template...', '✓ تم تطبيق القالب — اضغط على أي نص لتعديله': '✓ Template applied — click any text to edit it',
  'مكتبة قراءة Excel لم تُحمَّل — تأكد من الاتصال بالإنترنت': 'The Excel reader did not load — check your internet connection',
  'تعذر قراءة الملف — تأكد أنه ملف Excel أو CSV': 'Could not read the file — make sure it is an Excel or CSV file',
  'اسم الورقة': 'Sheet name', 'عمود %n': 'Column %n', 'لم يتم العثور على بيانات في الملف': 'No data found in the file',
  'تم تحميل %n طالب — اختر العمود المناسب للمتغيرات المعلَّمة باللون الأصفر': 'Loaded %n students — choose the right column for the variables marked in yellow',
  'تم تحميل %n طالب في %c صف': 'Loaded %n students in %c classes', '%n طالب': '%n students',
  '— بدون (كل الطلاب مجموعة واحدة) —': '— None (all students in one group) —', '— حسب ترتيبهم في الملف —': '— As ordered in the file —',
  'أبجدياً حسب: %c': 'Alphabetically by: %c',
  'الرابط غير صحيح — انسخ رابط الجدول من شريط العنوان في Google Sheets': 'Invalid link — copy the sheet link from the address bar in Google Sheets',
  'جاري جلب البيانات من Google Sheets...': 'Fetching data from Google Sheets...', 'جدول Google Sheets': 'Google Sheets table',
  '✓ تم تحديث البيانات — %n طالب': '✓ Data refreshed — %n students',
  'الجلب من Google Sheets يعمل من النسخة المنشورة على الإنترنت فقط: bayanakaam.github.io/certificate-generator': 'Fetching from Google Sheets only works on the online version: bayanakaam.github.io/certificate-generator',
  'لم يُعثر على الجدول — تأكد من الرابط': 'Sheet not found — check the link',
  'تعذر الوصول للجدول — افتحه في Google Sheets واضغط «مشاركة» ثم اختر «أي شخص لديه الرابط»': 'Cannot access the sheet — open it in Google Sheets, click “Share” and choose “Anyone with the link”',
  '— حمّل ملف البيانات لمعاينة الأسماء —': '— Load a data file to preview names —', '%a من %b': '%a of %b',
  'تحتاج اتصالاً بالإنترنت': 'An internet connection is needed', 'الطلاب': 'Students',
  'نموذج-بيانات-الطلاب.xlsx': 'sample-student-data.xlsx', 'نص': 'Text', 'أضف صورة الشهادة أولاً': 'Add the certificate image first',
  ' (نسخة)': ' (copy)', 'اضغط على اسم عمود أعلاه لإضافته كحقل': 'Click a column name above to add it as a field',
  'لا توجد حقول بعد': 'No fields yet', 'إظهار/إخفاء': 'Show/hide', 'بدون اسم': 'Untitled', '(فارغ)': '(empty)',
  'أعمدة أخرى في ملف Excel — اضغط لإضافتها:': 'Other columns in the Excel file — click to add:', 'إدراج': 'Insert',
  'اكتب اسم المتغير أولاً': 'Type a variable name first', 'هذا الاسم محجوز، اختر اسماً آخر': 'This name is reserved — choose another',
  'تمت إضافة «%v» — سيظهر على الشهادة عند إضافة صورتها': 'Added “%v” — it will appear once you add the certificate image',
  'الاسم الجديد للمتغير:': 'New variable name:', 'يوجد متغير بهذا الاسم': 'A variable with this name already exists',
  'تغيير الاسم': 'Rename', 'على الشهادة': 'On certificate', '+ أضفه للشهادة': '+ Add to certificate',
  'سيُعبّأ من ملف Excel': 'Will be filled from Excel', '✓ مرتبط بعمود: %c': '✓ Linked to column: %c',
  '⚠ لم يُعثر على عمود بهذا الاسم — اختر العمود:': '⚠ No column with this name — choose the column:',
  '— اختر العمود من ملف Excel —': '— Choose a column from Excel —', 'اقتراحات سريعة:': 'Quick suggestions:',
  'الصف': 'Class', 'بيانات-الشهادات.xlsx': 'certificate-data.xlsx',
  'عبّئ الملف ببيانات الطلاب (طالب في كل سطر) ثم ارفعه هنا': 'Fill in the student data (one student per row), then upload it here',
  'خطوط عربية': 'Arabic fonts', 'خطوط ويندوز المثبتة': 'Installed Windows fonts', 'خطوط إنجليزية': 'Latin fonts', 'خطوطك المرفوعة': 'Your uploaded fonts',
  'محمد أحمد — 2026': 'John Smith — 2026', 'هذه المتغيرات غير موجودة في الملف: %v': 'These variables are not in the file: %v',
  'تمت إضافة الخط: %n': 'Font added: %n', 'تعذر تحميل ملف الخط': 'Could not load the font file',
  'لا يوجد تصميم لحفظه بعد': 'There is no design to save yet', 'تصميم-الشهادة.json': 'certificate-design.json',
  'تم حفظ التصميم — افتحه لاحقاً من «فتح تصميم»': 'Design saved — open it later with “Open design”',
  'تم فتح التصميم': 'Design opened', 'ملف التصميم غير صالح': 'Invalid design file',
  'معاينة': 'preview', 'شهادة': 'certificates', 'صف': 'classes', 'حقل على كل شهادة': 'fields per certificate',
  'حمّل ملف بيانات الطلاب أولاً': 'Load the student data file first', 'أضف حقلاً واحداً على الأقل على الشهادة': 'Add at least one field to the certificate',
  '— بدون —': '— None —', 'مجلد لكل: %c': 'A folder per: %c',
  'اختر نوعاً واحداً على الأقل من المخرجات': 'Choose at least one output type',
  'مكتبة PDF لم تُحمَّل — تأكد من الاتصال بالإنترنت': 'The PDF library did not load — check your internet connection',
  'مكتبة الضغط لم تُحمَّل — تأكد من الاتصال بالإنترنت': 'The ZIP library did not load — check your internet connection',
  'اختر صفاً واحداً على الأقل': 'Choose at least one class', 'إيقاف': 'Stop', 'جاري تجهيز الخطوط...': 'Preparing fonts...',
  'الإجمالي': 'total', 'شهادات %c': 'Certificates %c', 'جاري إنشاء ملف PDF المجمّع...': 'Building the combined PDF...',
  'جميع الشهادات مرتبة حسب الصف.pdf': 'All certificates by class.pdf', 'جاري ضغط الملف...': 'Compressing...', 'الشهادات': 'Certificates',
  '✓ تم توليد %n شهادة في %c صف — تم تحميل ملف ZIP': '✓ Generated %n certificates in %c classes — ZIP downloaded',
  'تم! افتح ملف ZIP المحمَّل': 'Done! Open the downloaded ZIP file', 'تم الإيقاف': 'Stopped', 'حدث خطأ: ': 'An error occurred: ',
  // ---- delete / new design ----
  'تصميم جديد': 'New design', 'ابدأ تصميماً جديداً (يمسح كل شيء)': 'Start a new design (clears everything)',
  'حذف الصورة': 'Remove image', 'حذف البيانات': 'Remove data', 'الموقع فارغ أصلاً': 'Everything is already empty',
  'تم حذف الصورة — الحقول باقية بأماكنها. ارفع صورة جديدة (للتراجع: Ctrl+Z)': 'Image removed — fields stay in place. Upload a new image (undo: Ctrl+Z)',
  'تم حذف بيانات الطلاب — المتغيرات باقية. ارفع الملف الجديد (للتراجع: Ctrl+Z)': 'Student data removed — variables are kept. Upload the new file (undo: Ctrl+Z)',
  'سيتم مسح الصورة والحقول والمتغيرات والبيانات والبدء من جديد. هل أنت متأكد؟': 'This clears the image, fields, variables and data and starts over. Are you sure?',
  'تم البدء بتصميم جديد (للتراجع: Ctrl+Z)': 'Started a new design (undo: Ctrl+Z)',
  // ---- tour ----
  'أهلاً بك في مولّد الشهادات 👋': 'Welcome to Certificate Generator 👋',
  'في دقيقة واحدة تصنع شهادة لكل طالب من ملف Excel، مرتبة حسب الصف. خذ جولة سريعة (5 خطوات).': 'Make a certificate for every student from an Excel file in a minute, sorted by class. Take a quick tour (5 steps).',
  '١. صورة الشهادة': '1. Certificate image',
  'ارفع صورة شهادتك الفارغة، أو اختر من «قوالب جاهزة» تصميماً جاهزاً بنقرة واحدة.': 'Upload your blank certificate, or pick a design from “Ready templates” in one click.',
  '٢. المتغيرات': '2. Variables',
  'اكتب أسماء المعلومات التي تريدها على الشهادة (اسم الطالب، الصف، التقدير...). كل متغير يظهر كحقل تسحبه لمكانه.': 'Type the names of the information you want on the certificate (Student Name, Class, Grade...). Each variable appears as a field you drag into place.',
  '٣. بيانات الطلاب': '3. Student data',
  'ارفع ملف Excel أو الصق رابط Google Sheets. يُربط كل متغير بعموده تلقائياً، وتُرتَّب الشهادات حسب الصف.': 'Upload an Excel file or paste a Google Sheets link. Each variable links to its column automatically, and certificates are sorted by class.',
  '٤. صمّم الشهادة': '4. Design the certificate',
  'اسحب الحقول لمكانها، واسحب الزوايا لتكبير الخط. من لوحة التنسيق تختار الخط واللون. تنقّل بين الطلاب لمعاينة كل شهادة.': 'Drag fields into place and drag the corners to resize. Choose the font and color in the style panel. Step through students to preview each certificate.',
  '٥. ولّد الشهادات': '5. Generate',
  'اضغط هنا لتحصل على ملف ZIP فيه مجلد لكل صف وملف PDF جاهز للطباعة. يمكنك إعادة هذه الجولة من زر «؟» في الأعلى.': 'Click here to get a ZIP with a folder per class and a print-ready PDF. You can replay this tour from the “?” button at the top.',
  'الخطوة %a من %b': 'Step %a of %b', 'تخطي': 'Skip', 'السابق': 'Back', 'التالي': 'Next', 'ابدأ الآن': 'Get started',
};

let lang = 'ar';
try { const s = localStorage.getItem('certgen.lang'); if (s === 'en' || s === 'ar') lang = s; } catch {}
const missing = new Set();
function t(s, p) {
  let r = s;
  if (lang === 'en') { if (EN[s] != null) r = EN[s]; else missing.add(s); }
  if (p) r = r.replace(/%(\w+)/g, (m, k) => (k in p ? p[k] : m));
  return r;
}

/* static page text: remembered once, then swapped on every language change */
const AR = /[؀-ۿ]/;
let statics = null;
function collect() {
  statics = [];
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: n => (n.parentElement.closest('script,style,[data-nt]') || !AR.test(n.nodeValue)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  let n; while ((n = w.nextNode())) statics.push({ n, ar: n.nodeValue });
  for (const el of document.querySelectorAll('[title],[placeholder],[aria-label]')) {
    if (el.closest('[data-nt]')) continue;
    for (const a of ['title', 'placeholder', 'aria-label']) { const v = el.getAttribute(a); if (v && AR.test(v)) statics.push({ el, a, ar: v }); }
  }
}
function apply() {
  if (!statics) collect();
  for (const s of statics) {
    if (s.n) { const k = s.ar.trim(); s.n.nodeValue = lang === 'en' ? s.ar.replace(k, t(k)) : s.ar; }
    else s.el.setAttribute(s.a, lang === 'en' ? t(s.ar.trim()) : s.ar);
  }
  const root = document.documentElement;
  root.lang = lang; root.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.title = t('مولّد الشهادات');
}
const subs = [];
function setLang(l) {
  lang = l;
  try { localStorage.setItem('certgen.lang', l); } catch {}
  apply(); subs.forEach(f => f(l));
}
window.I18N = { t, apply, setLang, getLang: () => lang, onLang: f => subs.push(f), missing, EN };
})();
