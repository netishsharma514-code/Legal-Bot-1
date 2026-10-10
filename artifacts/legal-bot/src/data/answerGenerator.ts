import { SearchResult } from './engine';
import { Section, StructuredLegalAnswer, ApplicableProvision } from './types';

export type DetectedLanguage = 'hinglish' | 'hindi' | 'english';

export function detectLanguage(text: string): DetectedLanguage {
  // Check for Devanagari Unicode script range
  if (/[\u0900-\u097F]/.test(text)) {
    return 'hindi';
  }

  const lower = text.toLowerCase();
  const hinglishKeywords = [
    'agar', 'kya', 'nahi', 'kaise', 'mera', 'meri', 'kare', 'paas', 'tahat', 
    'bheje', 'batao', 'karu', 'sahayak', 'shikayat', 'dhamki', 'paisa', 'likhti', 
    'likha', 'mana', 'karti', 'karta', 'sakte', 'sakta', 'saktee', 'hain', 'hai', 
    'mujhe', 'hum', 'aap', 'apne', 'baad', 'chahiye', 'hoga', 'hogi', 'karne', 
    'wale', 'wali', 'waale', 'liye', 'saath', 'darj', 'karna', 'bataiye', 'madad',
    'hua', 'gaya', 'gayi', 'nikal', 'raha', 'rahi', 'kat', 'huye', 'chori', 'dhokha'
  ];

  const matched = hinglishKeywords.filter(k => new RegExp(`\\b${k}\\b`, 'i').test(lower));
  if (matched.length > 0) {
    return 'hinglish';
  }

  return 'english';
}

export type LegalIntent = 
  | 'sexual_violence'
  | 'fir_refusal'
  | 'cheque_bounce_138'
  | 'tenant_eviction'
  | 'cyber_fraud'
  | 'general';

export function classifyIntent(query: string): LegalIntent {
  const lower = query.toLowerCase().trim();

  // 1. Sexual violence / Rape
  if (
    lower.includes('rape') || 
    lower.includes('balatkar') || 
    lower.includes('sexual assault') || 
    lower.includes('molest') || 
    lower.includes('यौन उत्पीड़न') ||
    lower.includes('बलात्कार')
  ) {
    return 'sexual_violence';
  }

  // 2. Police refusal to register FIR / complaint
  if (
    (lower.includes('fir') || lower.includes('शिकायत') || lower.includes('complaint')) &&
    (lower.includes('nahi') || lower.includes('mana') || lower.includes('refuse') || lower.includes('न करे') || lower.includes('नहीं') || lower.includes('likh'))
  ) {
    return 'fir_refusal';
  }

  // 3. Cheque bounce / 138 Notice
  if (
    lower.includes('cheque') || 
    lower.includes('check') || 
    lower.includes('138') || 
    lower.includes('बाउंस') || 
    lower.includes('dishonour')
  ) {
    return 'cheque_bounce_138';
  }

  // 4. Tenant rights / Landlord eviction
  if (
    lower.includes('tenant') || 
    lower.includes('landlord') || 
    lower.includes('kirayedar') || 
    lower.includes('makan malik') || 
    lower.includes('nikal') || 
    lower.includes('evict') || 
    lower.includes('किराएदार') || 
    lower.includes('मकान मालिक')
  ) {
    return 'tenant_eviction';
  }

  // 5. Cyber financial fraud / unauthorized deduction
  if (
    lower.includes('cyber') || 
    lower.includes('साइबर') || 
    lower.includes('phishing') || 
    lower.includes('otp') || 
    lower.includes('upi fraud') || 
    (lower.includes('paise') && (lower.includes('kat') || lower.includes('fraud') || lower.includes('cut'))) ||
    (lower.includes('पैसे') && (lower.includes('कट') || lower.includes('धोखा')))
  ) {
    return 'cyber_fraud';
  }

  return 'general';
}

export function generateStructuredFallback(
  query: string,
  searchResult: SearchResult
): {
  structured: StructuredLegalAnswer;
  text: string;
  sectionsReferenced: Section[];
  quickActions: string[];
} {
  const lang = detectLanguage(query);
  const intent = classifyIntent(query);

  let structured: StructuredLegalAnswer;

  if (intent === 'sexual_violence') {
    if (lang === 'hindi') {
      structured = {
        quickAnswer: 'आप पूरी तरह सुरक्षित महसूस करें, इसमें आपकी कोई गलती नहीं है। कानून आपके साथ पूरी तरह खड़ा है। सबसे पहले अपनी शारीरिक सुरक्षा और आपातकालीन चिकित्सा सहायता सुनिश्चित करें (हेल्पलाइन 112 या महिला हेल्पलाइन 1090 पर तुरंत संपर्क करें)।',
         detailedExplanation: 'भारतीय कानून के तहत बलात्कार एक गंभीर, संज्ञेय और गैर-जमानती अपराध है। आपके पास धारा 173 BNSS के तहत किसी भी पुलिस थाने में ज़ीरो FIR दर्ज कराने, सरकारी अस्पताल में धारा 184 BNSS के तहत निःशुल्क चिकित्सीय उपचार व फॉरेंसिक जांच कराने, और महिला पुलिस अधिकारी अथवा मजिस्ट्रेट के समक्ष गोपनीय बयान दर्ज कराने का विधिक अधिकार है। आपको किसी भी स्तर पर निजी विवरण उजागर करने के लिए बाध्य नहीं किया जा सकता।',
        applicableLaws: [
          {
            actName: 'भारतीय न्याय संहिता, 2023 (BNS)',
            sectionNumber: 'धारा 64 (पूर्ववर्ती IPC धारा 376)',
            explanation: 'बलात्कार के अपराध के लिए 10 वर्ष से लेकर आजीवन कारावास और जुर्माने का प्रावधान।',
            whyApplicable: 'सहमति के बिना किए गए किसी भी यौन कृत्य पर सीधे लागू होता है।',
            conditionsOrLimitations: 'सटीक धाराएं और आरोप घटना की परिस्थितियों व साक्ष्यों पर निर्भर करते हैं।',
            officialSourceLink: 'https://www.indiacode.nic.in/handle/123456789/20062',
          },
          {
            actName: 'भारतीय नागरिक सुरक्षा संहिता, 2023 (BNSS)',
             sectionNumber: 'धारा 184 (पूर्ववर्ती CrPC धारा 164A)',
            explanation: 'पीड़िता की सरकारी अस्पताल में बिना किसी देरी के निःशुल्क चिकित्सीय एवं फॉरेंसिक जांच का अनिवार्य अधिकार।',
            whyApplicable: 'चिकित्सीय रिपोर्ट और फॉरेंसिक साक्ष्य की कानूनी ग्राह्यता के लिए।',
            conditionsOrLimitations: 'पीड़िता अथवा उसके विधिक अभिभावक की सहमति अनिवार्य है।',
            officialSourceLink: 'https://www.indiacode.nic.in/handle/123456789/20063',
          },
          {
            actName: 'भारतीय नागरिक सुरक्षा संहिता, 2023 (BNSS)',
            sectionNumber: 'धारा 173 (पूर्ववर्ती CrPC धारा 154)',
            explanation: 'महिला पुलिस अधिकारी द्वारा अनिवार्य FIR या ज़ीरो FIR पंजीकरण।',
            whyApplicable: 'अपराध स्थल के क्षेत्राधिकार की परवाह किए बिना तुरंत जांच शुरू करने हेतु।',
            conditionsOrLimitations: 'संज्ञेय अपराध की सूचना प्राप्त होने पर पुलिस मना नहीं कर सकती।',
            officialSourceLink: 'https://www.indiacode.nic.in/handle/123456789/20063',
          },
        ],
        immediateSteps: [
          'तुरंत सुरक्षित स्थान पर जाएं और विश्वसनीय व्यक्ति या राष्ट्रीय आपातकालीन नंबर 112 / महिला हेल्पलाइन 1090 पर कॉल करें।',
          'फॉरेंसिक साक्ष्य नष्ट होने से बचाने के लिए कपड़े न बदलें व स्नान करने से बचें, और निकटतम सरकारी अस्पताल में एमएलसी (MLC) कराएं।',
          'महिला पुलिस अधिकारी या महिला मजिस्ट्रेट के समक्ष बयान दर्ज कराएं और निःशुल्क एफआईआर प्रति प्राप्त करें।',
          'मुफ्त कानूनी सहायता व विधिक प्रतिनिधित्व के लिए नालसा (NALSA) 15100 पर संपर्क करें।',
        ],
        officialSources: [
          { title: 'National Legal Services Authority (NALSA)', url: 'https://nalsa.gov.in/', authority: 'Official Portal' },
          { title: 'National Commission for Women (NCW)', url: 'http://ncw.nic.in/', authority: 'Official Commission' },
          { title: 'India Code: Bharatiya Nyaya Sanhita, 2023', url: 'https://www.indiacode.nic.in/handle/123456789/20062', authority: 'Official Legislation' },
        ],
        disclaimer: 'यह जानकारी कानूनी जागरूकता एवं आपातकालीन अधिकारों के संदर्भ में है। लागू अपराध और धाराएं साक्ष्यों व परिस्थितियों पर निर्भर करते हैं।',
      };
    } else if (lang === 'hinglish') {
      structured = {
        quickAnswer: 'Aap bilkul safe feel karein, isme aapki koi galti nahi hai. Kanoon poori tarah se aapke sath khada hai. Sabse pehle apni physical safety aur immediate medical treatment ko priority dein (Helpline 112 ya Women Helpline 1090 par call karein).',
         detailedExplanation: 'Indian law ke tahat rape ek serious, cognizable aur non-bailable offence hai. Aapke paas Section 173 BNSS ke tahat kisi bhi police station me Zero FIR darj karwane, Section 184 BNSS ke tahat government hospital me free medical aur forensic examination karwane, aur female police officer ya Magistrate ke samne confidential statement record karwane ka poora statutory right hai. Kisi bhi victim ko intimate details disclose karne ke liye force nahi kiya ja sakta.',
        applicableLaws: [
          {
            actName: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
            sectionNumber: 'Section 64 (Formerly IPC Section 376)',
            explanation: 'Rape ke apradh ke liye minimum 10 saal se lekar life imprisonment aur fine ki statutory saza.',
            whyApplicable: 'Non-consensual sexual act par direct applicable hota hai.',
            conditionsOrLimitations: 'Exact charges aur provisions incident ki circumstances aur medical evidence par depend karte hain.',
            officialSourceLink: 'https://www.indiacode.nic.in/handle/123456789/20062',
          },
          {
            actName: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
             sectionNumber: 'Section 184 (Formerly CrPC Section 164A)',
            explanation: 'Government hospital me victim ki immediate, mandatory aur free medical examination.',
            whyApplicable: 'Forensic aur DNA evidence secure karne ke liye crucial step.',
            conditionsOrLimitations: 'Victim ya guardian ki explicit consent mandatory hai.',
            officialSourceLink: 'https://www.indiacode.nic.in/handle/123456789/20063',
          },
          {
            actName: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
            sectionNumber: 'Section 173 (Formerly CrPC Section 154)',
            explanation: 'Woman police officer dwara mandatory FIR ya Zero FIR darj karna.',
            whyApplicable: 'Jurisdiction ki parwah kiye bina turant investigation shuru karne ke liye.',
            conditionsOrLimitations: 'Police cognizable offence me FIR darj karne se mana nahi kar sakti.',
            officialSourceLink: 'https://www.indiacode.nic.in/handle/123456789/20063',
          },
        ],
        immediateSteps: [
          'Turant kisi safe location par jayein aur National Emergency 112 ya Women Helpline 1090 par call karein.',
          'Evidence preserve karne ke liye kapde change na karein aur snan na karein, aur hospital me Medico-Legal Case (MLC) karwayein.',
          'Woman police officer ya Magistrate ke samne statement record karwayein aur FIR ki free certified copy lein.',
          'Free legal aid advocate pane ke liye NALSA Helpline 15100 par sampark karein.',
        ],
        officialSources: [
          { title: 'National Legal Services Authority (NALSA)', url: 'https://nalsa.gov.in/', authority: 'Official Portal' },
          { title: 'National Commission for Women Helpline', url: 'http://ncw.nic.in/', authority: 'Official Commission' },
          { title: 'India Code: Bharatiya Nyaya Sanhita 2023', url: 'https://www.indiacode.nic.in/handle/123456789/20062', authority: 'Official Legislation' },
        ],
        disclaimer: 'Yeh guidance legal rights awareness ke liye hai. Exact offences aur legal recourse case ke factual circumstances par depend karte hain.',
      };
    } else {
      structured = {
        quickAnswer: 'Please know that you are not at fault and the law strictly protects you. Your immediate safety, medical care, and dignity are the highest priority. If in immediate danger, reach a safe location and dial 112 or Women Helpline 1090.',
        detailedExplanation: 'Under Indian law, sexual assault and rape are grave cognizable, non-bailable offences. You have statutory rights to immediate and free medical examination at any government hospital, registration of a Zero FIR at any police station regardless of jurisdiction, confidential statement recording before a female police officer or magistrate, and free legal aid representation under Article 39A and NALSA.',
        applicableLaws: [
          {
            actName: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
            sectionNumber: 'Section 64 (Formerly IPC Section 376)',
            explanation: 'Punishment for rape: rigorous imprisonment not less than 10 years extending to life imprisonment and fine.',
            whyApplicable: 'Directly applies to any non-consensual sexual assault.',
            conditionsOrLimitations: 'Applicability and aggravated provisions depend upon investigation facts.',
            officialSourceLink: 'https://www.indiacode.nic.in/handle/123456789/20062',
          },
          {
            actName: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
             sectionNumber: 'Section 184 (Formerly CrPC Section 164A)',
            explanation: 'Mandatory free medical examination and forensic evidence collection of victim at a government hospital.',
            whyApplicable: 'Ensures forensic preservation without delay or cost.',
            conditionsOrLimitations: 'Requires informed consent of the survivor.',
            officialSourceLink: 'https://www.indiacode.nic.in/handle/123456789/20063',
          },
          {
            actName: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
            sectionNumber: 'Section 173 (Formerly CrPC Section 154)',
            explanation: 'Mandatory recording of FIR by a female officer and provision of Zero FIR across jurisdictional boundaries.',
            whyApplicable: 'Prohibits police station personnel from turning away survivors.',
            conditionsOrLimitations: 'Police officer must provide a free signed copy immediately.',
            officialSourceLink: 'https://www.indiacode.nic.in/handle/123456789/20063',
          },
        ],
        immediateSteps: [
          'Reach a secure location and call National Emergency 112 or Women Helpline 1090.',
          'Preserve evidence by visiting the nearest government hospital for MLC before showering or changing clothing.',
          'Insist on recording statement with a female police officer and collect the signed FIR copy free of charge.',
          'Contact NALSA Helpline 15100 for a free assigned legal aid defense advocate.',
        ],
        officialSources: [
          { title: 'National Legal Services Authority (NALSA)', url: 'https://nalsa.gov.in/', authority: 'Official Portal' },
          { title: 'National Commission for Women (NCW)', url: 'http://ncw.nic.in/', authority: 'Official Commission' },
          { title: 'India Code: Bharatiya Nyaya Sanhita 2023', url: 'https://www.indiacode.nic.in/handle/123456789/20062', authority: 'Official Legislation' },
        ],
        disclaimer: 'This guidance provides statutory information. Specific criminal charges are framed based on facts confirmed during investigation.',
      };
    }
  } else if (intent === 'fir_refusal') {
    if (lang === 'hindi') {
      structured = {
        quickAnswer: 'यदि पुलिस संज्ञेय अपराध में आपकी एफआईआर दर्ज करने से मना करती है, तो यह कानून का उल्लंघन है। आप धारा 173(4) BNSS के तहत पुलिस अधीक्षक (SP) को लिखित शिकायत भेज सकते हैं या धारा 175(3) BNSS के तहत न्यायिक मजिस्ट्रेट से एफआईआर दर्ज कराने का आदेश प्राप्त कर सकते हैं।',
        detailedExplanation: 'सुप्रीम कोर्ट (ललिता कुमारी बनाम यूपी राज्य) और BNSS के तहत संज्ञेय अपराध (चोरी, मारपीट, धोखाधड़ी, साइबर अपराध) की सूचना मिलने पर पुलिस के लिए एफआईआर दर्ज करना अनिवार्य है। यदि थाना प्रभारी मना करता है, तो कानून में तीन स्पष्ट कानूनी उपचार उपलब्ध हैं: पुलिस अधीक्षक को पंजीकृत डाक से शिकायत, न्यायिक मजिस्ट्रेट के समक्ष आवेदन, तथा एफआईआर दर्ज न करने वाले पुलिस अधिकारी के विरुद्ध धारा 199 BNS (पूर्ववर्ती 166A IPC) के तहत 2 वर्ष की सजा हेतु अभियोजन।',
        applicableLaws: [
          {
            actName: 'भारतीय नागरिक सुरक्षा संहिता, 2023 (BNSS)',
            sectionNumber: 'धारा 173(4) (पूर्ववर्ती CrPC धारा 154(3))',
            explanation: 'थाना प्रभारी द्वारा एफआईआर से इनकार करने पर पुलिस अधीक्षक (SP / DCP) को लिखित शिकायत प्रेषित करने का अधिकार।',
            whyApplicable: 'वरिष्ठ अधिकारी को स्वयं जांच करने अथवा किसी अधीनस्थ को जांच का निर्देश देने का अधिकार देता है।',
            conditionsOrLimitations: 'शिकायत लिखित में एवं पंजीकृत डाक द्वारा भेजी जानी चाहिए।',
            officialSourceLink: 'https://www.indiacode.nic.in/handle/123456789/20063',
          },
          {
            actName: 'भारतीय नागरिक सुरक्षा संहिता, 2023 (BNSS)',
            sectionNumber: 'धारा 175(3) (पूर्ववर्ती CrPC धारा 156(3))',
            explanation: 'न्यायिक मजिस्ट्रेट के समक्ष आवेदन देकर पुलिस को अनिवार्य एफआईआर पंजीकरण व जांच का निर्देश दिलवाना।',
            whyApplicable: 'जब पुलिस थाने और एसपी स्तर पर कोई कार्रवाई न हो तो सीधे न्यायिक आदेश प्राप्त करने हेतु।',
            conditionsOrLimitations: 'एसपी को भेजी गई लिखित शिकायत की प्रति और पावती संलग्न करना अनिवार्य है।',
            officialSourceLink: 'https://www.indiacode.nic.in/handle/123456789/20063',
          },
          {
            actName: 'भारतीय न्याय संहिता, 2023 (BNS)',
            sectionNumber: 'धारा 199 (पूर्ववर्ती IPC धारा 166A)',
            explanation: 'कानून के निर्देशों का उल्लंघन कर एफआईआर दर्ज न करने वाले पुलिस अधिकारी को 6 माह से 2 वर्ष तक का कारावास व जुर्माना।',
            whyApplicable: 'कर्तव्य में लापरवाही बरतने वाले पुलिस अधिकारी की व्यक्तिगत आपराधिक जवाबदेही सुनिश्चित करने हेतु।',
            conditionsOrLimitations: 'अपराध संज्ञेय श्रेणी का होना चाहिए।',
            officialSourceLink: 'https://www.indiacode.nic.in/handle/123456789/20062',
          },
        ],
        immediateSteps: [
          'थाना प्रभारी (SHO) को दी गई लिखित शिकायत की पावती (Receiving / Diary Entry Number) सुरक्षित रखें।',
          'पंजीकृत डाक या स्पीड पोस्ट से जिले के पुलिस अधीक्षक (SP / SSP / DCP) को विस्तृत शिकायत भेजें और पोस्टल रसीद संभालें।',
          'यदि एसपी कार्यालय से भी कार्रवाई न हो, तो स्थानीय अधिवक्ता के माध्यम से मजिस्ट्रेट कोर्ट में धारा 175(3) BNSS का आवेदन दाखिल करें।',
          'मुफ्त कानूनी सलाह व ड्राफ्टिंग के लिए जिला विधिक सेवा प्राधिकरण (DLSA) या 15100 पर संपर्क करें।',
        ],
        officialSources: [
          { title: 'India Code: Bharatiya Nagarik Suraksha Sanhita, 2023', url: 'https://www.indiacode.nic.in/handle/123456789/20063', authority: 'Official Legislation' },
          { title: 'National Legal Services Authority (NALSA)', url: 'https://nalsa.gov.in/', authority: 'Official Legal Aid' },
        ],
        disclaimer: 'यह जानकारी प्रक्रियात्मक अधिकारों के संबंध में है। मजिस्ट्रेट आवेदन के लिए क्षेत्राधिकार अनुसार प्रारूप तैयार करना आवश्यक होता है।',
      };
    } else {
      // Hinglish / English
      structured = {
        quickAnswer: lang === 'hinglish' 
          ? 'Agar police cognizable offence me FIR likhne se mana karti hai, to yeh gair-kanooni hai. Aap BNSS Section 173(4) ke tahat Superintendent of Police (SP) ko written complaint bhej sakte hain ya Section 175(3) BNSS ke tahat Judicial Magistrate se FIR ka order karwa sakte hain.'
          : 'If the police refuse to register an FIR for a cognizable offence, it violates statutory law. You can send a written complaint to the Superintendent of Police (SP) under Section 173(4) BNSS or approach the Judicial Magistrate under Section 175(3) BNSS for a court directive to register the FIR.',
        detailedExplanation: lang === 'hinglish'
          ? 'Supreme Court ke landmark judgment (Lalita Kumari v. Govt of UP) aur BNSS ke tahat har cognizable offence (chori, assault, cheating, cyber crime) me FIR darj karna mandatory hai. Police officer ka FIR na likhna Section 199 BNS (purana 166A IPC) ke tahat 2 saal tak ki jail ka offence hai. Agar SHO mana kare, to step-by-step remedies available hain: pehle SP ko registered post se complaint, phir Magistrate ke samne Section 175(3) ka application.'
          : 'Under Supreme Court binding precedent (Lalita Kumari v. Govt of UP) and Section 173 BNSS, registering an FIR is mandatory for any cognizable offence. A police officer who refuses to record an FIR commits an offence punishable with up to 2 years imprisonment under Section 199 BNS (formerly Section 166A IPC). Statutory remedies follow a clear hierarchy: written escalation to the SP/DCP, followed by an application before the Judicial Magistrate.',
        applicableLaws: [
          {
            actName: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
            sectionNumber: 'Section 173(4) (Formerly CrPC Section 154(3))',
            explanation: lang === 'hinglish' ? 'SHO dwara mana karne par Superintendent of Police (SP/DCP) ko written complaint bhejna.' : 'Sending written complaint by registered post to Superintendent of Police upon refusal by SHO.',
            whyApplicable: 'Direct senior police administrative remedy.',
            conditionsOrLimitations: 'Must be sent in writing with postal tracking receipt preserved.',
            officialSourceLink: 'https://www.indiacode.nic.in/handle/123456789/20063',
          },
          {
            actName: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
            sectionNumber: 'Section 175(3) (Formerly CrPC Section 156(3))',
            explanation: lang === 'hinglish' ? 'Judicial Magistrate ke paas application file karke police ko mandatory FIR darj karne ka order lena.' : 'Judicial application before Magistrate directing police to register FIR and investigate.',
            whyApplicable: 'Judicial remedy when police department fails to act.',
            conditionsOrLimitations: 'Requires affidavit and proof of prior representation to police station and SP.',
            officialSourceLink: 'https://www.indiacode.nic.in/handle/123456789/20063',
          },
          {
            actName: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
            sectionNumber: 'Section 199 (Formerly IPC Section 166A)',
            explanation: lang === 'hinglish' ? 'FIR darj na karne wale police officer par 6 mahine se 2 saal tak ki jail aur fine.' : 'Punishment for public servant disobeying direction under law by refusing to record information.',
            whyApplicable: 'Statutory penal deterrence against non-registration.',
            conditionsOrLimitations: 'Applies to cognizable crimes under law.',
            officialSourceLink: 'https://www.indiacode.nic.in/handle/123456789/20062',
          },
        ],
        immediateSteps: [
          lang === 'hinglish' ? 'Police station me di gayi complaint ki receiving/acknowledgement diary number preserve karein.' : 'Preserve written acknowledgement or GD entry number from the police station.',
          lang === 'hinglish' ? 'Registered Post ya Speed Post se district SP/DCP ko detailed complaint bhejein.' : 'Send detailed complaint to district SP/DCP via Registered Post / Speed Post.',
          lang === 'hinglish' ? 'Agar SP level par action na ho, to advocate ke zariye Magistrate court me Section 175(3) BNSS file karein.' : 'File Section 175(3) BNSS application before Judicial Magistrate First Class.',
          lang === 'hinglish' ? 'Free legal aid aur draft help ke liye NALSA Helpline 15100 par call karein.' : 'Contact NALSA Helpline 15100 for free court representation.',
        ],
        officialSources: [
          { title: 'India Code: Bharatiya Nagarik Suraksha Sanhita, 2023', url: 'https://www.indiacode.nic.in/handle/123456789/20063', authority: 'Official Legislation' },
          { title: 'National Legal Services Authority (NALSA)', url: 'https://nalsa.gov.in/', authority: 'Official Portal' },
        ],
        disclaimer: 'Procedural guidance under BNSS 2023. Court applications must comply with jurisdictional court practice rules.',
      };
    }
  } else if (intent === 'cheque_bounce_138') {
    const isHindi = lang === 'hindi';
    const isHinglish = lang === 'hinglish';
    structured = {
      quickAnswer: isHindi
        ? 'चेक बाउंस होने पर बैंक रिटर्न मेमो मिलने के 30 दिनों के भीतर देनदार को 15-दिवसीय वैधानिक लीगल नोटिस (Statutory Notice) भेजना अनिवार्य है। यदि वह 15 दिनों में भुगतान नहीं करता, तो अगले 30 दिनों में धारा 138 NI एक्ट के तहत कोर्ट में आपराधिक परिवाद दर्ज करना होगा।'
        : isHinglish
        ? 'Cheque bounce hone par bank return memo milne ke 30 days ke andar drawer ko Section 138 NI Act ke tahat 15-day statutory legal notice bhejna mandatory hai. Agar 15 din me payment na mile, to agle 30 days me court me criminal complaint file karni hoti hai.'
        : 'Upon cheque dishonour, you must issue a statutory 15-day Demand Notice to the drawer within 30 days of receiving the bank return memo. If payment is not made within 15 days of notice receipt, a criminal complaint under Section 138 Negotiable Instruments Act must be filed within 30 days thereafter.',
      detailedExplanation: isHindi
        ? 'निगोशिएबल इंस्ट्रूमेंट्स एक्ट (NI Act) की धारा 138 के तहत चेक अनादर एक आपराधिक अपराध है, जिसमें चेक राशि के दोगुने तक का जुर्माना और 2 वर्ष तक का कारावास हो सकता है। प्रक्रिया की समय-सीमा अत्यंत सख्त है: (1) चेक वैधता अवधि (3 माह) में बैंक में प्रस्तुत हो; (2) बाउंस मेमो मिलने के 30 दिन के भीतर पंजीकृत डाक (Registered Post AD / Speed Post) से लिखित नोटिस भेजा जाए; (3) नोटिस प्राप्ति से 15 दिन का भुगतान समय दिया जाए; (4) 15 दिन बीतने के बाद 30 दिनों के भीतर क्षेत्राधिकारी मजिस्ट्रेट के समक्ष परिवाद दाखिल हो।'
        : isHinglish
        ? 'Negotiable Instruments Act ke Section 138 ke tahat cheque bounce criminal offence hai jisme cheque amount ka double fine aur 2 saal tak ki jail ho sakti hai. Iski limitation timelines bohot strict hain: (1) Cheque 3 months ki validity me bank me present ho; (2) Return memo milne ke 30 days me Registered AD/Speed Post se 15-day notice bhejein; (3) Notice delivery ke 15 days pure hone par agar payment na mile, to next 30 days me Judicial Magistrate ke paas Section 138 complaint file karein.'
        : 'Under Section 138 of the Negotiable Instruments Act, 1881, cheque dishonour for insufficient funds or exceeding arrangements constitutes a quasi-criminal offence punishable with imprisonment up to 2 years and fine up to twice the cheque amount. Statutory timelines are mandatory: (1) Present cheque within validity (3 months); (2) Issue demand notice within 30 days of return memo; (3) Allow 15 days for payment; (4) File complaint before Magistrate within 30 days of cause of action.',
      applicableLaws: [
        {
          actName: 'Negotiable Instruments Act, 1881',
          sectionNumber: 'Section 138',
          explanation: 'Dishonour of cheque for insufficiency of funds; criminal liability and penalty up to twice the cheque amount and 2 years imprisonment.',
          whyApplicable: 'Primary substantive provision governing dishonoured cheques issued for legally enforceable debt.',
          conditionsOrLimitations: 'Cheque must be issued against legally enforceable liability, not for a gift or illegal debt.',
          officialSourceLink: 'https://www.indiacode.nic.in/handle/123456789/2189',
        },
        {
          actName: 'Negotiable Instruments Act, 1881',
          sectionNumber: 'Section 142',
          explanation: 'Cognizance of offences: court takes cognizance only upon written complaint filed within 1 month of cause of action.',
          whyApplicable: 'Governs limitation and jurisdictional rules for filing criminal complaint in court.',
          conditionsOrLimitations: 'Strict 30-day limitation from expiry of 15-day notice period.',
          officialSourceLink: 'https://www.indiacode.nic.in/handle/123456789/2189',
        },
        {
          actName: 'Negotiable Instruments Act, 1881',
          sectionNumber: 'Section 143A',
          explanation: 'Interim compensation: court may order drawer to pay up to 20% of the cheque amount to complainant pending trial.',
          whyApplicable: 'Immediate financial relief to the payee during trial proceedings.',
          conditionsOrLimitations: 'Payable within 60 days of court direction.',
          officialSourceLink: 'https://www.indiacode.nic.in/handle/123456789/2189',
        },
      ],
      immediateSteps: [
        isHindi ? 'बैंक से ओरिजिनल चेक और बैंक रिटर्न मेमो (Reason Memo) की प्रमाणित प्रति प्राप्त करें।' : 'Obtain original bounced cheque and bank return memo with official stamp.',
        isHindi ? '30 दिनों के भीतर पंजीकृत डाक (Registered Post AD / Speed Post) से 15-दिवसीय वैधानिक मांग नोटिस भेजें।' : 'Issue 15-day Statutory Demand Notice via Registered Post AD / Speed Post within 30 days.',
        isHindi ? 'डाक रसीद और इंडिया पोस्ट की ऑनलाइन डिलीवरी ट्रैकिंग रिपोर्ट संभाल कर रखें।' : 'Preserve India Post tracking report and consignment receipt as proof of delivery.',
        isHindi ? '15 दिन में भुगतान न मिलने पर 30 दिनों के अंदर मजिस्ट्रेट कोर्ट में अधिवक्ता के माध्यम से परिवाद दर्ज कराएं।' : 'If drawer fails to pay within 15 days, file complaint before Judicial Magistrate within 30 days.',
      ],
      officialSources: [
        { title: 'India Code: Negotiable Instruments Act, 1881', url: 'https://www.indiacode.nic.in/handle/123456789/2189', authority: 'Official Legislation' },
        { title: 'Supreme Court Guidelines on Cheque Dishonour Expedited Trial', url: 'https://main.sci.gov.in/', authority: 'Supreme Court of India' },
      ],
      disclaimer: 'Statutory guidance under Section 138 NI Act. Strict limitation periods apply; missing deadlines may extinguish criminal remedy.',
    };
  } else if (intent === 'tenant_eviction') {
    const isHindi = lang === 'hindi';
    const isHinglish = lang === 'hinglish';
    structured = {
      quickAnswer: isHindi
        ? 'मकान मालिक आपको बिना विधिक प्रक्रिया (Due Process of Law) और सक्षम न्यायालय/रेंट अथॉरिटी के आदेश के जबरन घर से नहीं निकाल सकता। बिजली, पानी या अन्य आवश्यक सेवाएं काटना गैर-कानूनी है।'
        : isHinglish
        ? 'Makan malik bina due legal process aur Rent Authority/Civil Court ke order ke aapko zabardasti ghar se bahar nahi nikal sakta. Bijli, paani ya basic facilities cut karna kanoon ke khilaaf hai.'
        : 'A landlord cannot unlawfully evict you or throw you out without following due process of law and obtaining a valid eviction order from the competent Rent Authority or Civil Court. Cutting off electricity, water, or locking the premises is strictly illegal.',
      detailedExplanation: isHindi
        ? 'मॉडल टेनेंसी एक्ट और विभिन्न राज्यों के रेंट कंट्रोल कानूनों के तहत किराएदारों को जबरन बेदखली से सुरक्षा प्राप्त है। मकान मालिक केवल विशिष्ट आधारों (किराया न देना, अनुबंध उल्लंघन, व्यक्तिगत आवश्यकता) पर ही उचित नोटिस देकर रेंट कोर्ट में बेदखली याचिका दाखिल कर सकता है। सुप्रीम कोर्ट के कई निर्णयों के अनुसार, पुलिस का उपयोग करके किसी किराएदार को गैर-कानूनी रूप से बेदखल नहीं कराया जा सकता; ऐसा करने पर किराएदार दीवानी अदालत से निषेधाज्ञा (Injunction) प्राप्त कर सकता है और आपराधिक अतिचार की शिकायत दर्ज करा सकता है।'
        : isHinglish
        ? 'Model Tenancy Act aur state rent control acts ke tahat tenants ko protection milti hai. Landlord bina court order ke force use karke nikalne ki koshish kare to yeh illegal trespass hai. Landlord ko valid eviction notice dena padta hai. Agar landlord bijli ya paani kaat de, to aap Rent Authority me immediate relief ke liye application file kar sakte hain aur Civil Court se injunction (stay order) le sakte hain.'
        : 'Under tenancy laws and Supreme Court settled jurisprudence, a tenant in possession cannot be dispossessed except in accordance with the procedure established by law. The landlord must serve a formal notice and obtain an eviction decree from the Rent Court or Civil Judge. Withholding essential supplies like electricity, water, or sanitary services is penalized. A tenant facing forcible dispossession can obtain an immediate civil injunction (stay order) and lodge a police complaint for criminal trespass.',
      applicableLaws: [
        {
          actName: 'Model Tenancy Act / State Rent Control Acts',
          sectionNumber: 'Section 20 & 21 (Protection Against Eviction)',
          explanation: 'Prohibits eviction without adjudication by Rent Court; mandates grounds such as structural misuse or non-payment.',
          whyApplicable: 'Guarantees due process and statutory notice before eviction.',
          conditionsOrLimitations: 'Subject to terms of valid registered tenancy agreement.',
          officialSourceLink: 'https://mohua.gov.in/upload/uploadfiles/files/Model_Tenancy_Act_English.pdf',
        },
        {
          actName: 'Model Tenancy Act',
          sectionNumber: 'Section 17 (Essential Services Protection)',
          explanation: 'Landlord cannot cut off or withhold essential supplies (water, electricity, lift, access) to force eviction.',
          whyApplicable: 'Direct relief against landlord harassment.',
          conditionsOrLimitations: 'Rent Authority can penalize landlord and restore services within 24 hours.',
          officialSourceLink: 'https://mohua.gov.in/upload/uploadfiles/files/Model_Tenancy_Act_English.pdf',
        },
        {
          actName: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
          sectionNumber: 'Section 329 (Criminal Trespass) & Section 351 (Intimidation)',
          explanation: 'Forcible entry, breaking locks, or threatening tenant constitutes cognizable criminal trespass and intimidation.',
          whyApplicable: 'Applies if landlord attempts physical force or goons to evict.',
          conditionsOrLimitations: 'Tenant must possess valid rent receipts or agreement proof.',
          officialSourceLink: 'https://www.indiacode.nic.in/handle/123456789/20062',
        },
      ],
      immediateSteps: [
        isHindi ? 'रेंट एग्रीमेंट, किराया भुगतान की रसीदें (Bank Transfer / UPI / Cash Receipts) सुरक्षित रखें।' : 'Preserve rental agreement and rent payment receipts / bank UPI transfers.',
        isHindi ? 'यदि मकान मालिक धमकी दे या आवश्यक सेवाएं काटे, तो 112 पर पुलिस कॉल करें और डायरी एंट्री कराएं।' : 'If threatened or services cut, call 112 police emergency and register complaint.',
        isHindi ? 'दीवानी अदालत (Civil Court) से जबरन बेदखली के विरुद्ध निषेधाज्ञा (Temporary Injunction / Stay) प्राप्त करें।' : 'File civil suit for injunction against unlawful dispossession through an advocate.',
        isHindi ? 'मुफ्त कानूनी सहायता के लिए DLSA विधिक सेवा केंद्र 15100 पर संपर्क करें।' : 'Approach District Legal Services Authority (DLSA) / 15100 for tenant legal aid.',
      ],
      officialSources: [
        { title: 'Ministry of Housing and Urban Affairs: Model Tenancy Act', url: 'https://mohua.gov.in/upload/uploadfiles/files/Model_Tenancy_Act_English.pdf', authority: 'Official Ministry Framework' },
        { title: 'National Legal Services Authority (NALSA)', url: 'https://nalsa.gov.in/', authority: 'Official Legal Aid' },
      ],
      disclaimer: 'Tenancy rules vary by State Rent Control enactments. Please verify local state tenancy amendments.',
    };
  } else if (intent === 'cyber_fraud') {
    const isHindi = lang === 'hindi';
    const isHinglish = lang === 'hinglish';
    structured = {
      quickAnswer: isHindi
        ? 'साइबर फ्रॉड में पैसे कटते ही पहले 2 घंटे ("Golden Hour") के भीतर राष्ट्रीय साइबर हेल्पलाइन 1930 पर तुरंत कॉल करें और अपने बैंक को अनधिकृत लेन-देन की सूचना देकर खाता व कार्ड तुरंत ब्लॉक कराएं।'
        : isHinglish
        ? 'Cyber fraud me paise katte hi sabse pehle 1-2 ghante ke andar National Cyber Helpline 1930 par call karein aur apne bank ko inform karke account/card block karwayein taaki paise freeze ho sakein.'
        : 'Immediately call the National Cyber Financial Fraud Helpline 1930 within the "Golden Hour" (first 1-2 hours) to freeze the stolen funds in the beneficiary accounts, and immediately notify your bank to block your account and cards.',
      detailedExplanation: isHindi
        ? 'जब ऑनलाइन धोखाधड़ी (UPI, नेट बैंकिंग, फ़िशिंग, क्रेडिट कार्ड) होती है, तो हेल्पलाइन 1930 और cybercrime.gov.in पोर्टल पर त्वरित रिपोर्ट करने से इंडियन साइबर क्राइम कोऑर्डिनेशन सेंटर (I4C) लाभार्थी बैंक खातों में राशि पर तुरंत "Lien Freeze" लगा देता है। इसके अलावा, भारतीय रिज़र्व बैंक (RBI) के सर्कुलर के अनुसार, यदि उपभोक्ता अनधिकृत लेन-देन की सूचना 3 कार्य दिवसों के भीतर अपने बैंक को दे देता है, तो थर्ड-पार्टी धोखाधड़ी में उपभोक्ता की देयता शून्य (Zero Liability) होती है।'
        : isHinglish
        ? 'Online fraud hote hi Helpline 1930 par complaint karne se Citizen Financial Cyber Fraud Reporting System beneficiary ke bank account me paise lien freeze kar deta hai. Saath hi RBI Customer Protection Circular ke tahat agar aap 3 working days ke andar bank ko inform kar dete hain, to third party breach me customer ki zero liability hoti hai aur bank ko paisa wapas karna padta hai.'
        : 'When cyber financial fraud occurs, reporting immediately to Helpline 1930 and cybercrime.gov.in triggers the Citizen Financial Cyber Fraud Reporting System, placing an immediate lien on the fraudster accounts across interconnected banks and payment gateways. Under RBI Customer Protection guidelines, reporting unauthorized electronic transactions within 3 working days guarantees Zero Liability for the customer.',
      applicableLaws: [
        {
          actName: 'Information Technology Act, 2000',
          sectionNumber: 'Section 66D',
          explanation: 'Punishment for cheating by personation by using computer resources: up to 3 years imprisonment and ₹1,00,000 fine.',
          whyApplicable: 'Directly covers UPI scams, phishing, fake bank calls, and lottery/job fraud.',
          conditionsOrLimitations: 'Applies to any computer, smartphone, or communication device.',
          officialSourceLink: 'https://www.indiacode.nic.in/handle/123456789/1999',
        },
        {
          actName: 'Information Technology Act, 2000',
          sectionNumber: 'Section 66C',
          explanation: 'Punishment for identity theft and fraudulent use of password, OTP, or digital signature.',
          whyApplicable: 'Applies to unauthorized SIM swap, net banking takeover, and stolen card details.',
          conditionsOrLimitations: 'Cognizable and bailable offence.',
          officialSourceLink: 'https://www.indiacode.nic.in/handle/123456789/1999',
        },
        {
          actName: 'RBI Customer Protection Directives',
          sectionNumber: 'Circular DBR.No.Leg.BC.78/09.07.005/2017-18',
          explanation: 'Zero Liability of a customer in unauthorized electronic banking transactions notified within 3 days.',
          whyApplicable: 'Mandates bank refund where consumer did not share OTP/negligence.',
          conditionsOrLimitations: 'Customer must notify the bank within 3 working days of the transaction.',
          officialSourceLink: 'https://www.rbi.org.in/',
        },
      ],
      immediateSteps: [
        isHindi ? 'तुरंत राष्ट्रीय साइबर वित्तीय धोखाधड़ी हेल्पलाइन 1930 पर कॉल करें और लेन-देन UTR नंबर नोट कराएं।' : 'Call National Cyber Financial Fraud Helpline 1930 immediately.',
        isHindi ? 'अपने बैंक के कस्टमर केयर पर कॉल करके डेबिट कार्ड, यूपीआई और नेट बैंकिंग तुरंत ब्लॉक कराएं।' : 'Notify your bank immediately to block accounts and debit cards.',
        isHindi ? 'cybercrime.gov.in पर बैंक स्टेटमेंट और एसएमएस स्क्रीनशॉट के साथ औपचारिक ऑनलाइन शिकायत दर्ज करें।' : 'File formal complaint on cybercrime.gov.in with transaction UTR numbers and screenshots.',
        isHindi ? '3 दिनों के भीतर बैंक शाखा में लिखित विवाद पत्र (Dispute Form / Chargeback) पावती सहित जमा करें।' : 'Submit written dispute chargeback form to your home bank branch within 3 days.',
      ],
      officialSources: [
        { title: 'National Cyber Crime Reporting Portal', url: 'https://cybercrime.gov.in/', authority: 'Ministry of Home Affairs' },
        { title: 'Reserve Bank of India: Customer Protection Directives', url: 'https://www.rbi.org.in/', authority: 'Reserve Bank of India' },
        { title: 'India Code: Information Technology Act, 2000', url: 'https://www.indiacode.nic.in/handle/123456789/1999', authority: 'Official Legislation' },
      ],
      disclaimer: 'Cyber financial recovery depends on early lien-freeze reporting before the recipient account withdraws funds.',
    };
  } else {
    // General legal inquiry
    const isHindi = lang === 'hindi';
    const isHinglish = lang === 'hinglish';
    structured = {
      quickAnswer: isHindi
        ? `आपके प्रश्न: "${query}" का कानूनी विश्लेषण किया गया है। भारतीय कानून के तहत नागरिक अधिकारों, प्रक्रियात्मक नियमों एवं संबंधित धाराओं की पुष्टि की गई है।`
        : isHinglish
        ? `Aapke sawal: "${query}" ka legal assessment kiya gaya hai. Indian statutes aur citizen remedies ke tahat related legal provisions identify kiye gaye hain.`
        : `Assessment for your inquiry: "${query}". Relevant procedural remedies and statutory provisions under Indian law have been identified.`,
      detailedExplanation: isHindi
        ? 'भारतीय विधि व्यवस्था में प्रत्येक विवाद के लिए विशिष्ट अधिकार क्षेत्र (आपराधिक, दीवानी, उपभोक्ता, या विधिक सहायता) निर्धारित है। मामले की सफलता ठोस दस्तावेजी साक्ष्यों, समय-सीमा (Limitation Period) के अनुपालन और उचित विधिक मंच पर निर्भर करती है।'
        : isHinglish
        ? 'Indian legal system me har grievance ke liye specific jurisdiction (Civil, Criminal, Consumer, or Rent) hota hai. Valid evidence, written notices aur time limitations ko follow karna legal protection ke liye zaroori hota hai.'
        : 'Under Indian jurisprudence, grievances fall under specific jurisdictions (Civil, Criminal, Consumer, or Constitutional). Proper documentation, strict adherence to statutory limitation periods, and early notice issuance preserve your remedies.',
      applicableLaws: searchResult.sections.slice(0, 3).map((s) => ({
        actName: s.act,
        sectionNumber: `Section ${s.number}${s.ipcNumber ? ` (Formerly IPC ${s.ipcNumber})` : ''}`,
        explanation: s.description.slice(0, 180) + '...',
        whyApplicable: `Relates to ${s.title}`,
        conditionsOrLimitations: s.bailable ? 'Bailable Offence / Civil remedy' : 'Non-Bailable Offence',
        officialSourceLink: s.officialLink || 'https://www.indiacode.nic.in/',
      })),
      immediateSteps: [
        isHindi ? 'सभी संबंधित लेन-देन, संदेश, ईमेल व अनुबंध सुरक्षित रखें।' : 'Preserve all relevant communications, contracts, and receipts.',
        isHindi ? 'संबंधित मंच (थाना, उपभोक्ता आयोग, रेंट कोर्ट) पर औपचारिक कदम उठाएं।' : 'Initiate formal steps with the competent jurisdictional authority.',
        isHindi ? 'निःशुल्क सरकारी कानूनी सहायता हेतु NALSA हेल्पलाइन 15100 पर संपर्क करें।' : 'Contact NALSA Helpline 15100 for free government legal aid assistance.',
      ],
      officialSources: [
        { title: 'India Code: Digital Repository of Indian Enactments', url: 'https://www.indiacode.nic.in/', authority: 'Legislative Department, Ministry of Law' },
        { title: 'National Legal Services Authority (NALSA)', url: 'https://nalsa.gov.in/', authority: 'Government of India' },
      ],
      disclaimer: 'This guidance is for informational legal awareness and does not create an advocate-client relationship.',
    };
  }

  // Format full plain text markdown
  const text = formatStructuredToMarkdown(structured);

  return {
    structured,
    text,
    sectionsReferenced: searchResult.sections,
    quickActions: [
      lang === 'hindi' ? 'धारा का विवरण देखें' : 'View Section Details',
      lang === 'hindi' ? 'वकील से संपर्क करें' : 'Consult Nearby Advocate',
      lang === 'hindi' ? 'मुफ्त कानूनी सहायता' : 'Free Legal Aid (NALSA)',
    ],
  };
}

export function formatStructuredToMarkdown(s: StructuredLegalAnswer): string {
  let md = `### 1. Quick Answer\n${s.quickAnswer}\n\n`;
  md += `### 2. Detailed Explanation\n${s.detailedExplanation}\n\n`;

  if (s.applicableLaws && s.applicableLaws.length > 0) {
    md += `### 3. Applicable Laws and Sections\n`;
    s.applicableLaws.forEach((law) => {
      md += `#### **${law.actName} — ${law.sectionNumber}**\n`;
      md += `- **Explanation**: ${law.explanation}\n`;
      md += `- **Why It Applies**: ${law.whyApplicable}\n`;
      if (law.conditionsOrLimitations) {
        md += `- **Conditions & Limitations**: ${law.conditionsOrLimitations}\n`;
      }
      md += `- **Official Source**: [${law.actName} on India Code](${law.officialSourceLink})\n\n`;
    });
  }

  if (s.immediateSteps && s.immediateSteps.length > 0) {
    md += `### Immediate Practical Next Steps\n`;
    s.immediateSteps.forEach((step, idx) => {
      md += `${idx + 1}. ${step}\n`;
    });
    md += `\n`;
  }

  if (s.officialSources && s.officialSources.length > 0) {
    md += `### 4. Official Sources & Portals\n`;
    s.officialSources.forEach((src) => {
      md += `- [${src.title}](${src.url}) *(${src.authority})*\n`;
    });
    md += `\n`;
  }

  md += `*Disclaimer: ${s.disclaimer}*`;
  return md;
}

export function generateStatutoryAnswer(query: string, searchResult: SearchResult): {
  text: string;
  sectionsReferenced: Section[];
  quickActions: string[];
  structured?: StructuredLegalAnswer;
} {
  return generateStructuredFallback(query, searchResult);
}
