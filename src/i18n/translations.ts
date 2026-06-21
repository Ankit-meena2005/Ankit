export type Lang = 'en' | 'hi' | 'rj'

export type TranslationKey =
  | 'nav.home' | 'nav.farm' | 'nav.satellite' | 'nav.planner' | 'nav.irrigation'
  | 'nav.soil' | 'nav.market' | 'nav.prices' | 'nav.jobs' | 'nav.finance'
  | 'nav.image' | 'nav.community' | 'nav.alerts' | 'nav.rajasthan' | 'nav.services'
  | 'nav.analytics' | 'nav.admin'
  | 'cta.start' | 'cta.explore' | 'cta.reachOut'
  | 'hero.badge' | 'hero.title' | 'hero.subtitle'
  | 'common.save' | 'common.call' | 'common.maps' | 'common.directions' | 'common.whatsapp'

// Translations for the three languages.
// Rajasthani (rj) uses localized phrasing distinct from standard Hindi.
export const translations: Record<Lang, Record<TranslationKey, string>> = {
  en: {
    'nav.home': 'Home', 'nav.farm': 'Farm Twin', 'nav.satellite': 'Satellite',
    'nav.planner': 'Crop Planner', 'nav.irrigation': 'Irrigation', 'nav.soil': 'Soil',
    'nav.market': 'Marketplace', 'nav.prices': 'Price Forecast', 'nav.jobs': 'Jobs',
    'nav.finance': 'Finance', 'nav.image': 'Image AI', 'nav.community': 'Community',
    'nav.alerts': 'Alerts', 'nav.rajasthan': 'Rajasthan', 'nav.services': 'Nearby',
    'nav.analytics': 'Analytics', 'nav.admin': 'Admin',
    'cta.start': 'Get Started Free', 'cta.explore': 'Explore Platform',
    'cta.reachOut': 'Reach Out',
    'hero.badge': "AI-powered farming platform for India",
    'hero.title': 'From soil to sale — intelligent farming, end to end',
    'hero.subtitle':
      'FarmSOS blends satellite monitoring, AI advisory and a marketplace built for Indian smallholder farmers — starting in Rajasthan.',
    'common.save': 'Save', 'common.call': 'Call', 'common.maps': 'Maps',
    'common.directions': 'Directions', 'common.whatsapp': 'WhatsApp'
  },
  hi: {
    'nav.home': 'मुख्य', 'nav.farm': 'फार्म ट्विन', 'nav.satellite': 'उपग्रह',
    'nav.planner': 'फसल योजना', 'nav.irrigation': 'सिंचाई', 'nav.soil': 'मृदा',
    'nav.market': 'बाज़ार', 'nav.prices': 'मूल्य पूर्वानुमान', 'nav.jobs': 'रोज़गार',
    'nav.finance': 'वित्त', 'nav.image': 'इमेज AI', 'nav.community': 'समुदाय',
    'nav.alerts': 'अलर्ट', 'nav.rajasthan': 'राजस्थान', 'nav.services': 'नज़दीकी',
    'nav.analytics': 'विश्लेषण', 'nav.admin': 'एडमिन',
    'cta.start': 'मुफ़्त शुरू करें', 'cta.explore': 'प्लेटफ़ॉर्म देखें',
    'cta.reachOut': 'संपर्क करें',
    'hero.badge': 'भारत के लिए एआई-संचालित कृषि प्लेटफ़ॉर्म',
    'hero.title': 'मिट्टी से बिक्री तक — बुद्धिमान खेती, शुरू से अंत तक',
    'hero.subtitle':
      'फ़ार्मएसओएस उपग्रह निगरानी, एआई सलाह और भारतीय छोटे किसानों के लिए बाज़ार को जोड़ता है — राजस्थान से शुरू।',
    'common.save': 'सहेजें', 'common.call': 'कॉल', 'common.maps': 'नक्शा',
    'common.directions': 'दिशा', 'common.whatsapp': 'व्हाट्सएप'
  },
  rj: {
    'nav.home': 'घर', 'nav.farm': 'खेत ट्विन', 'nav.satellite': 'सैटलाइट',
    'nav.planner': 'फसल योजना', 'nav.irrigation': 'सिंचाई', 'nav.soil': 'माटी',
    'nav.market': 'मंडी', 'nav.prices': 'भाव अनुमान', 'nav.jobs': 'नौकरी',
    'nav.finance': 'रकम', 'nav.image': 'तस्वीर AI', 'nav.community': 'भाईबंद',
    'nav.alerts': 'सुनाव', 'nav.rajasthan': 'राजस्थान', 'nav.services': 'नेरै ठिकाण',
    'nav.analytics': 'विश्लेषण', 'nav.admin': 'अधिकारी',
    'cta.start': 'आजै मुफत शूरू करो', 'cta.explore': 'प्लेटफार्म देखो',
    'cta.reachOut': 'बोल लागो',
    'hero.badge': 'राजस्थान म्ह एआई-संचालित खेती वाळो प्लेटफार्म',
    'hero.title': 'माटी ऊण लेवां — समझदार खेती, सुरू ऊण अंत लागो',
    'hero.subtitle':
      'फार्मएसओएस सैटलाइट निगराणी, एआई सलाह अर राजस्थानी किसान नै बाजार रै तैयारी अथै — कोटा ऊण शुरू।',
    'common.save': 'राखो', 'common.call': 'फोन', 'common.maps': 'नक्शो',
    'common.directions': 'राह बतावो', 'common.whatsapp': 'व्हाट्सएप'
  }
}
