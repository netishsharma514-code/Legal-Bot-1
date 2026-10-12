import { SearchResult } from './engine';
import { Section, StructuredLegalAnswer, ApplicableProvision } from './types';

export type DetectedLanguage = 'hinglish' | 'hindi' | 'english';

const HINDI_SCRIPT = /[\u0900-\u097F]/;
const HINGLISH_WORDS = [
  'agar', 'kya', 'nahi', 'nahin', 'kaise', 'mera', 'meri', 'mere', 'kare',
  'paas', 'tahat', 'bheje', 'batao', 'karu', 'shikayat', 'dhamki', 'paisa',
  'paise', 'likhti', 'likha', 'mana', 'karti', 'karta', 'sakte', 'sakta',
  'hain', 'hai', 'mujhe', 'hum', 'aap', 'apne', 'baad', 'chahiye', 'hoga',
  'hogi', 'karne', 'wale', 'wali', 'waale', 'liye', 'saath', 'darj', 'karna',
  'bataiye', 'madad', 'hua', 'gaya', 'gayi', 'raha', 'rahi', 'chori', 'dhokha',
];

export function detectLanguage(text: string): DetectedLanguage {
  if (HINDI_SCRIPT.test(text)) return 'hindi';

  const words = new Set((text.toLowerCase().match(/[a-z]+/g) || []));
  return HINGLISH_WORDS.some((word) => words.has(word)) ? 'hinglish' : 'english';
}

export type LegalIntent =
  | 'sexual_violence'
  | 'fir_refusal'
  | 'cheque_bounce_138'
  | 'tenant_eviction'
  | 'cyber_fraud'
  | 'general';

export function classifyIntent(query: string): LegalIntent {
  const q = query.toLowerCase();

  if (
    /\b(rape|raped|raping|sexual assault|molest|molestation)\b/.test(q) ||
    /बलात्कार|यौन उत्पीड़न|छेड़छाड़/.test(q) ||
    /\b(balatkar|zabardasti|jabardasti)\b/.test(q)
  ) return 'sexual_violence';

  if (
    (/\bfir\b|शिकायत|complaint/.test(q)) &&
    /\b(nahi|nahin|mana|refuse|refused|refusing|likh|register)\b|नहीं|न करे|मना/.test(q)
  ) return 'fir_refusal';

  if (
    /\bcheque bounce|check bounce|dishonou?red cheque|dishonou?red check|section 138|ni act\b/.test(q) ||
    /चेक बाउंस|चेक अनादर|बाउंस/.test(q)
  ) return 'cheque_bounce_138';

  if (
    /\b(tenant|landlord|rent|rented|evict|eviction|tenancy)\b/.test(q) ||
    /किराएदार|किरायेदार|मकान मालिक|किराया|बेदखल/.test(q) ||
    /\b(kirayedar|makan malik|kiraya|nikal raha|ghar se nikal)\b/.test(q)
  ) return 'tenant_eviction';

  if (
    /\b(cyber fraud|online fraud|upi fraud|phishing|otp scam|identity theft|unauthori[sz]ed transaction)\b/.test(q) ||
    /\botp\b|साइबर|ऑनलाइन धोखाधड़ी|पैसे कट|धोखाधड़ी/.test(q) ||
    (/\bpaise\b|\bpaisa\b/.test(q) && /\b(kat|fraud|scam|chori|nikal)\b/.test(q))
  ) return 'cyber_fraud';

  return 'general';
}

type LanguageCopy = {
  quick: string;
  detail: string;
  steps: string[];
};

function copyForLanguage(
  lang: DetectedLanguage,
  english: LanguageCopy,
  hindi: LanguageCopy,
  hinglish: LanguageCopy,
): LanguageCopy {
  if (lang === 'hindi') return hindi;
  if (lang === 'hinglish') return hinglish;
  return english;
}

function provision(
  actName: string,
  sectionNumber: string,
  explanation: string,
  whyApplicable: string,
  officialSourceLink: string,
  conditionsOrLimitations?: string,
): ApplicableProvision {
  return {
    actName,
    sectionNumber,
    explanation,
    whyApplicable,
    ...(conditionsOrLimitations ? { conditionsOrLimitations } : {}),
    officialSourceLink,
  };
}

const BNS_URL = 'https://www.indiacode.nic.in/';
const BNSS_URL = 'https://www.indiacode.nic.in/';
const NALSA_URL = 'https://nalsa.gov.in/';
const CYBER_URL = 'https://cybercrime.gov.in/';
const RBI_URL = 'https://www.rbi.org.in/';
const CONSTITUTION_URL = 'https://legislative.gov.in/constitution-of-india/';

function buildIntentAnswer(
  query: string,
  lang: DetectedLanguage,
  intent: LegalIntent,
): StructuredLegalAnswer | undefined {
  if (intent === 'sexual_violence') {
    const c = copyForLanguage(lang,
      {
        quick: 'If you are in immediate danger, move to a safer place and call 112. You are entitled to seek medical care and report the incident; you do not have to decide every legal step at once.',
        detail: 'Rape and other sexual offences are governed by the applicable provisions of the Bharatiya Nyaya Sanhita, 2023 (BNS), along with procedural protections under the Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS). The precise offence and applicable section depend on the facts, the survivor’s age, the conduct alleged, and other circumstances. A survivor may seek medical treatment, report the incident to police, and request support from a trusted person or a legal-aid service. Do not delay urgent medical care to preserve evidence.',
        steps: [
          'If there is immediate danger, call 112 or go to a safe place.',
          'Seek medical care as soon as possible; treatment should not be delayed for police formalities.',
          'If you choose to report, provide the information to police and keep a copy or reference number for the complaint.',
          'For legal-aid information, contact NALSA at 15100 or your District Legal Services Authority.',
        ],
      },
      {
        quick: 'यदि तत्काल खतरा है, तो सुरक्षित स्थान पर जाएँ और 112 पर कॉल करें। आप चिकित्सा सहायता लेने और घटना की शिकायत करने के हकदार हैं; सभी कानूनी कदम एक साथ तय करना ज़रूरी नहीं है।',
        detail: 'बलात्कार और अन्य यौन अपराधों पर भारतीय न्याय संहिता, 2023 (BNS) के लागू प्रावधान तथा प्रक्रिया संबंधी मामलों में भारतीय नागरिक सुरक्षा संहिता, 2023 (BNSS) लागू हो सकती है। सही अपराध और धारा घटना के तथ्यों, पीड़ित की उम्र, कथित कृत्य और अन्य परिस्थितियों पर निर्भर करते हैं। पीड़ित चिकित्सा उपचार ले सकता/सकती है, पुलिस को सूचना दे सकता/सकती है और विश्वसनीय व्यक्ति या विधिक सहायता से सहयोग माँग सकता/सकती है। साक्ष्य बचाने के लिए आवश्यक चिकित्सा उपचार में देरी न करें।',
        steps: [
          'तत्काल खतरा हो तो 112 पर कॉल करें या सुरक्षित स्थान पर जाएँ।',
          'जल्द से जल्द चिकित्सा सहायता लें; पुलिस की औपचारिकताओं के कारण उपचार में देरी न करें।',
          'शिकायत करना चाहें तो पुलिस को जानकारी दें और शिकायत की प्रति या संदर्भ संख्या सुरक्षित रखें।',
          'विधिक सहायता के लिए NALSA 15100 या जिला विधिक सेवा प्राधिकरण से संपर्क करें।',
        ],
      },
      {
        quick: 'Agar immediate danger hai, safe jagah par jaayein aur 112 par call karein. Aap medical help lene aur incident report karne ke haqdar hain; saare legal steps ek saath decide karna zaroori nahi hai.',
        detail: 'Rape aur doosre sexual offences par Bharatiya Nyaya Sanhita, 2023 (BNS) ke relevant provisions aur procedure ke liye Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS) apply ho sakti hai. Exact offence aur section facts, survivor ki age, alleged conduct aur baaki circumstances par depend karte hain. Survivor medical treatment le sakta/sakti hai, police ko report kar sakta/sakti hai aur trusted person ya legal-aid service se support maang sakta/sakti hai. Evidence preserve karne ke liye urgent medical care delay na karein.',
        steps: [
          'Immediate danger ho to 112 par call karein ya safe jagah par jaayein.',
          'Jaldi medical care lein; police formalities ke liye treatment delay na karein.',
          'Report karna chahein to police ko information dein aur complaint ki copy/reference number sambhal kar rakhein.',
          'Legal aid ke liye NALSA 15100 ya District Legal Services Authority se contact karein.',
        ],
      });
    return {
      quickAnswer: c.quick,
      detailedExplanation: c.detail,
      applicableLaws: [
        provision('Bharatiya Nyaya Sanhita, 2023 (BNS)', 'Relevant sexual-offence provision — confirm from current statute',
          'The applicable offence and punishment depend on the specific facts and statutory ingredients.',
          'Potentially relevant where the reported conduct meets the elements of an offence under BNS.',
          BNS_URL, 'This general response does not determine the exact offence or section.'),
        provision('Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)', 'FIR and investigation provisions',
          'BNSS governs criminal procedure, including recording information about cognizable offences.',
          'Relevant if the survivor decides to report the incident.',
          BNSS_URL, 'Confirm the current statutory text and local procedure.'),
      ],
      immediateSteps: c.steps,
      officialSources: [
        { title: 'India Code — official central legislation database', url: 'https://www.indiacode.nic.in/', authority: 'Government of India' },
        { title: 'National Legal Services Authority (NALSA)', url: NALSA_URL, authority: 'Government of India' },
        { title: 'Emergency Response Support System', url: 'https://112.gov.in/', authority: 'Government of India' },
      ],
      disclaimer: 'General legal information, not a finding about the facts or a substitute for confidential advice from a qualified lawyer. Immediate safety and medical care take priority.',
    };
  }

  if (intent === 'fir_refusal') {
    const c = copyForLanguage(lang,
      {
        quick: 'If police refuse to record information about a cognizable offence, you can send the substance of the information in writing to the Superintendent of Police under Section 173(4) BNSS. If that does not resolve the matter, you may apply to the jurisdictional Magistrate under Section 175(3) BNSS, subject to its procedural requirements.',
        detail: 'Whether an FIR is required depends on whether the information discloses a cognizable offence and on any legally permitted preliminary inquiry. Keep a copy of the complaint submitted to the police station and proof of delivery. A written escalation to the SP should describe the incident, dates, available evidence, and the earlier refusal. An application to the Magistrate has procedural requirements; obtain local legal assistance if possible. Do not assume every police refusal is automatically a separate criminal offence.',
        steps: [
          'Write down the date, police station, officer details if known, and what happened when you tried to report.',
          'Keep a copy of the complaint and any acknowledgement, diary number, email, or delivery proof.',
          'Send the information in writing to the SP under Section 173(4) BNSS.',
          'If there is still no action, seek advice from a lawyer or DLSA about an application under Section 175(3) BNSS.',
        ],
      },
      {
        quick: 'यदि पुलिस संज्ञेय अपराध की सूचना दर्ज करने से मना करे, तो आप BNSS की धारा 173(4) के तहत सूचना लिखित रूप में पुलिस अधीक्षक (SP) को भेज सकते हैं। इसके बाद भी कार्रवाई न हो, तो प्रक्रिया संबंधी शर्तों के अधीन BNSS की धारा 175(3) के तहत क्षेत्राधिकार वाले मजिस्ट्रेट के समक्ष आवेदन किया जा सकता है।',
        detail: 'FIR दर्ज करना आवश्यक है या नहीं, यह इस बात पर निर्भर करता है कि सूचना से संज्ञेय अपराध बनता है या नहीं और कानून के तहत कोई प्रारंभिक जाँच अनुमत है या नहीं। थाने में दी गई शिकायत की प्रति और जमा करने का प्रमाण सुरक्षित रखें। SP को भेजी जाने वाली शिकायत में घटना, तारीखें, उपलब्ध साक्ष्य और पहले की गई शिकायत/इनकार का विवरण दें। मजिस्ट्रेट के समक्ष आवेदन की प्रक्रियात्मक शर्तें होती हैं; संभव हो तो स्थानीय विधिक सहायता लें। हर पुलिस इनकार अपने-आप अलग आपराधिक अपराध नहीं बनता।',
        steps: [
          'शिकायत देने की तारीख, थाने का नाम, अधिकारी का विवरण (यदि पता हो) और हुई बातचीत लिखकर रखें।',
          'शिकायत की प्रति, प्राप्ति, डायरी नंबर, ईमेल या डाक का प्रमाण सुरक्षित रखें।',
          'BNSS धारा 173(4) के तहत सूचना लिखित रूप में SP को भेजें।',
          'फिर भी कार्रवाई न हो तो BNSS धारा 175(3) के आवेदन के लिए वकील या DLSA से सलाह लें।',
        ],
      },
      {
        quick: 'Agar police cognizable offence ki information record karne se mana kare, to BNSS Section 173(4) ke tahat written complaint SP ko bhej sakte hain. Action na ho to procedure follow karke BNSS Section 175(3) ke tahat jurisdictional Magistrate ke paas application di ja sakti hai.',
        detail: 'FIR zaroori hai ya nahi, yeh depend karta hai ki information se cognizable offence banta hai ya nahi aur law ke tahat preliminary inquiry allowed hai ya nahi. Police station me di gayi complaint ki copy aur delivery proof sambhal kar rakhein. SP ko written complaint me incident, dates, available evidence aur pehle ki complaint/refusal ka detail dein. Magistrate application ki procedural requirements hoti hain; possible ho to local legal aid lein. Har police refusal automatically alag criminal offence nahi hota.',
        steps: [
          'Complaint ki date, police station, officer ki details agar pata hon, aur refusal ka record banayein.',
          'Complaint copy, receiving, diary number, email ya postal proof sambhal kar rakhein.',
          'BNSS Section 173(4) ke tahat written information SP ko bhejein.',
          'Action na ho to BNSS Section 175(3) application ke liye lawyer ya DLSA se advice lein.',
        ],
      });
    return {
      quickAnswer: c.quick,
      detailedExplanation: c.detail,
      applicableLaws: [
        provision('Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)', 'Section 173(4)',
          'Provides a route to send the substance of information in writing to the Superintendent of Police when the officer in charge refuses to record it.',
          'Relevant where a police station has refused to record information about an alleged cognizable offence.',
          BNSS_URL, 'Check the current text and required manner of submission.'),
        provision('Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)', 'Section 175(3)',
          'Provides a Magistrate route for directing investigation, subject to statutory safeguards and procedure.',
          'May be considered if the police escalation does not resolve the issue.',
          BNSS_URL, 'Court practice and procedural requirements may apply.'),
      ],
      immediateSteps: c.steps,
      officialSources: [
        { title: 'India Code — official central legislation database', url: 'https://www.indiacode.nic.in/', authority: 'Government of India' },
        { title: 'NALSA — legal aid information', url: NALSA_URL, authority: 'Government of India' },
      ],
      disclaimer: 'This is general procedural information. Whether the reported facts disclose a cognizable offence and which remedy is appropriate depends on the facts and current law.',
    };
  }

  if (intent === 'cheque_bounce_138') {
    const c = copyForLanguage(lang,
      {
        quick: 'For a cheque-dishonour claim under Section 138 of the Negotiable Instruments Act, the statutory timelines are strict. Generally, the demand notice must be sent within 30 days of receiving information from the bank about dishonour; the drawer then has 15 days after receiving the notice to pay. If payment is not made, the complaint deadline is generally one month from when the cause of action arises. Confirm dates with a lawyer promptly.',
        detail: 'Section 138 applies only when its statutory ingredients are met, including a cheque drawn for a legally enforceable debt or liability and dishonour for a reason covered by the section. The cheque must be presented within its validity period. The notice and complaint deadlines are governed by Sections 138 and 142; delay may be condoned by the court in circumstances permitted by law. Keep the cheque, bank return memo, notice, proof of dispatch/delivery, and payment records.',
        steps: [
          'Obtain and preserve the cheque and bank return memo.',
          'Write down the bank memo date, notice date, and notice delivery date.',
          'Ask a lawyer to prepare and send the statutory demand notice within the applicable deadline.',
          'Keep proof of dispatch/delivery and payment records; promptly check the complaint limitation date.',
        ],
      },
      {
        quick: 'चेक बाउंस के मामले में Negotiable Instruments Act की धारा 138 की समय-सीमाएँ सख्त होती हैं। सामान्यतः बैंक से चेक अनादर की सूचना मिलने के 30 दिनों के भीतर मांग नोटिस भेजना होता है। नोटिस मिलने के बाद भुगतान के लिए 15 दिन मिलते हैं। भुगतान न होने पर कारण-ए-दावा उत्पन्न होने से सामान्यतः एक महीने के भीतर शिकायत दाखिल करनी होती है। तारीखें तुरंत वकील से जाँचें।',
        detail: 'धारा 138 तभी लागू होती है जब उसके वैधानिक तत्व पूरे हों, जिनमें कानूनी रूप से वसूल योग्य ऋण/देयता के लिए जारी चेक और धारा में शामिल कारण से उसका अनादर शामिल है। चेक उसकी वैधता अवधि के भीतर प्रस्तुत होना चाहिए। नोटिस और शिकायत की समय-सीमा धारा 138 और 142 से नियंत्रित होती है; कानून द्वारा अनुमत परिस्थितियों में अदालत देरी माफ कर सकती है। चेक, बैंक रिटर्न मेमो, नोटिस, डाक/डिलीवरी प्रमाण और भुगतान रिकॉर्ड सुरक्षित रखें।',
        steps: [
          'मूल चेक और बैंक रिटर्न मेमो सुरक्षित रखें।',
          'बैंक मेमो, नोटिस और नोटिस की डिलीवरी की तारीखें लिख लें।',
          'लागू समय-सीमा के भीतर वैधानिक मांग नोटिस भेजने के लिए वकील से तुरंत संपर्क करें।',
          'डाक/डिलीवरी प्रमाण और भुगतान रिकॉर्ड रखें तथा शिकायत की अंतिम तारीख की पुष्टि करें।',
        ],
      },
      {
        quick: 'Cheque bounce ke Section 138 NI Act case me timelines strict hoti hain. Generally, bank se dishonour ki information milne ke 30 din ke andar demand notice bhejna hota hai. Notice receive hone ke baad drawer ko payment ke liye 15 din milte hain. Payment na ho to cause of action arise hone ke baad generally ek month me complaint file karni hoti hai. Dates lawyer se jaldi verify karein.',
        detail: 'Section 138 tabhi apply hota hai jab statutory conditions poori hon, jaise legally enforceable debt/liability ke liye cheque aur section ke andar aane wale reason se dishonour. Cheque ko validity period ke andar present karna hota hai. Notice aur complaint deadlines Sections 138 aur 142 me di gayi hain; law ke allowed cases me court delay condone kar sakti hai. Cheque, return memo, notice, dispatch/delivery proof aur payment records safe rakhein.',
        steps: [
          'Cheque aur bank return memo preserve karein.',
          'Bank memo, notice aur notice delivery ki dates note karein.',
          'Applicable deadline ke andar statutory demand notice bhejne ke liye lawyer se turant baat karein.',
          'Dispatch/delivery proof aur payment records rakhein; complaint ki last date verify karein.',
        ],
      });
    return {
      quickAnswer: c.quick,
      detailedExplanation: c.detail,
      applicableLaws: [
        provision('Negotiable Instruments Act, 1881', 'Section 138',
          'Sets out the offence and statutory conditions relating to dishonour of certain cheques for insufficiency of funds or covered reasons.',
          'Potentially relevant where a cheque issued for a legally enforceable debt or liability has been dishonoured.',
          'https://www.indiacode.nic.in/', 'The section’s ingredients and exceptions must be checked against the facts.'),
        provision('Negotiable Instruments Act, 1881', 'Section 142',
          'Governs cognizance, who may file the complaint, and the complaint limitation framework.',
          'Relevant when determining the proper complainant, court and filing deadline.',
          'https://www.indiacode.nic.in/', 'Confirm the exact limitation date and any legally available condonation.'),
      ],
      immediateSteps: c.steps,
      officialSources: [
        { title: 'India Code — Negotiable Instruments Act, 1881', url: 'https://www.indiacode.nic.in/', authority: 'Government of India' },
      ],
      disclaimer: 'This is general information, not a calculation of your deadline. The exact dates and statutory requirements should be checked promptly with a qualified lawyer.',
    };
  }

  if (intent === 'tenant_eviction') {
    const c = copyForLanguage(lang,
      {
        quick: 'A landlord generally cannot use force or self-help to remove a tenant who is in possession; the lawful process depends on the state’s tenancy law, the agreement, and the facts. If you face an immediate threat, call 112. Preserve your agreement and rent-payment evidence.',
        detail: 'Tenancy law differs by state, and the Model Tenancy Act is not automatically the governing law in every state unless adopted or implemented there. The applicable statute, lease terms, notice requirements, forum and grounds for eviction need to be checked locally. Do not assume every eviction notice is invalid or that every service interruption is governed by the same rule. A lawyer or District Legal Services Authority can help assess urgent relief.',
        steps: [
          'Keep the rent agreement, receipts, bank/UPI records, notices and relevant messages.',
          'Record any threats, attempted lockout or interruption of essential services, where safe and lawful.',
          'If there is immediate danger or violence, call 112.',
          'Ask a local lawyer or DLSA about the state-specific rent law and urgent injunction or complaint options.',
        ],
      },
      {
        quick: 'मकान मालिक सामान्यतः बल प्रयोग या स्वयं कार्रवाई करके कब्जे में रह रहे किरायेदार को नहीं निकाल सकता। सही प्रक्रिया राज्य के किराया कानून, समझौते और तथ्यों पर निर्भर करती है। तत्काल खतरा हो तो 112 पर कॉल करें और किराया समझौता व भुगतान के प्रमाण सुरक्षित रखें।',
        detail: 'किरायेदारी के नियम राज्य के अनुसार अलग होते हैं। Model Tenancy Act हर राज्य में अपने-आप लागू नहीं होता; यह देखना ज़रूरी है कि संबंधित राज्य ने इसे अपनाया/लागू किया है या नहीं। लागू कानून, किराया समझौता, नोटिस, उचित मंच और बेदखली के आधार स्थानीय रूप से जाँचने चाहिए। यह मानना सही नहीं कि हर नोटिस अवैध है या हर सेवा कटौती पर एक ही नियम लागू होता है। वकील या जिला विधिक सेवा प्राधिकरण तत्काल राहत के विकल्प समझा सकता है।',
        steps: [
          'किराया समझौता, रसीदें, बैंक/UPI रिकॉर्ड, नोटिस और संबंधित संदेश सुरक्षित रखें।',
          'सुरक्षित और वैध हो तो धमकी, ताला बदलने या आवश्यक सेवाएँ रोकने की घटनाओं का रिकॉर्ड रखें।',
          'तत्काल खतरा या हिंसा हो तो 112 पर कॉल करें।',
          'राज्य के लागू किराया कानून और निषेधाज्ञा/शिकायत के विकल्पों के लिए स्थानीय वकील या DLSA से सलाह लें।',
        ],
      },
      {
        quick: 'Makan malik generally force ya self-help se possession me reh rahe tenant ko nahi nikal sakta. Legal process state ke rent law, agreement aur facts par depend karta hai. Immediate threat ho to 112 call karein. Rent agreement aur payment proof sambhal kar rakhein.',
        detail: 'Tenancy rules state ke hisaab se alag hote hain. Model Tenancy Act har state me automatically apply nahi hota; check karna hota hai ki state ne adopt/implement kiya hai ya nahi. Applicable law, rent agreement, notice requirements, forum aur eviction grounds locally verify karne chahiye. Har eviction notice illegal nahi hota aur har service cut-off par same rule apply nahi hota. Lawyer ya DLSA urgent relief ke options samjha sakte hain.',
        steps: [
          'Rent agreement, receipts, bank/UPI records, notices aur relevant messages sambhal kar rakhein.',
          'Safe aur lawful ho to threats, lockout ya essential services interruption ka record rakhein.',
          'Immediate danger ya violence ho to 112 call karein.',
          'State-specific rent law aur injunction/complaint options ke liye local lawyer ya DLSA se advice lein.',
        ],
      });
    return {
      quickAnswer: c.quick,
      detailedExplanation: c.detail,
      applicableLaws: [
        provision('Applicable State tenancy / rent-control law', 'State-specific provision — identify from location and facts',
          'Tenant protections, eviction grounds and procedure depend on the law in force in the relevant state.',
          'Potentially relevant to a threatened or actual eviction.',
          'https://www.indiacode.nic.in/', 'The Model Tenancy Act is not automatically applicable in every state.'),
      ],
      immediateSteps: c.steps,
      officialSources: [
        { title: 'India Code — central and state legislation resources', url: 'https://www.indiacode.nic.in/', authority: 'Government of India' },
        { title: 'NALSA — legal aid information', url: NALSA_URL, authority: 'Government of India' },
      ],
      disclaimer: 'Tenancy law is state-specific. This general answer cannot determine whether a notice or proposed eviction is lawful without the state, agreement and facts.',
    };
  }

  if (intent === 'cyber_fraud') {
    const c = copyForLanguage(lang,
      {
        quick: 'If money has just been taken through a suspected cyber financial fraud, call 1930 immediately and report it at the National Cyber Crime Reporting Portal. Contact your bank using its official number to report the unauthorised transaction and secure the account. Reporting quickly may help, but does not guarantee recovery or a refund.',
        detail: 'Keep the transaction ID/UTR, date and time, amount, bank messages, screenshots, phone numbers, URLs and complaint acknowledgements. Do not share OTPs, PINs or passwords with anyone claiming they can recover the money. RBI customer-liability rules depend on the type of transaction, when the bank is notified, and whether customer negligence or third-party breach is involved; a refund is not automatically guaranteed in every case.',
        steps: [
          'Call 1930 promptly and file/complete the report at https://cybercrime.gov.in/.',
          'Notify your bank through its official app, website or phone number and ask to secure the account/payment instrument and register a dispute.',
          'Save UTR/transaction IDs, messages, screenshots, complaint numbers and bank correspondence.',
          'Do not pay a recovery agent or share OTP, PIN, CVV or passwords.',
        ],
      },
      {
        quick: 'Agar abhi cyber financial fraud me paise kate hain, turant 1930 par call karein aur National Cyber Crime Reporting Portal par report karein. Bank ke official number se unauthorized transaction report karke account secure karayein. Jaldi report karne se madad mil sakti hai, lekin recovery ya refund guaranteed nahi hota.',
        detail: 'Transaction ID/UTR, date-time, amount, bank messages, screenshots, phone numbers, URLs aur complaint acknowledgements sambhal kar rakhein. Paise recover karne ka daawa karne wale kisi vyakti ko OTP, PIN ya password na dein. RBI customer-liability rules transaction ke type, bank ko kab bataya gaya aur customer negligence/third-party breach jaise facts par depend karte hain; har case me refund automatic guaranteed nahi hota.',
        steps: [
          'Jaldi 1930 par call karein aur https://cybercrime.gov.in/ par report file/complete karein.',
          'Bank ke official app, website ya phone number se inform karein aur account/payment instrument secure karwa kar dispute register karein.',
          'UTR/transaction ID, messages, screenshots, complaint numbers aur bank correspondence sambhal kar rakhein.',
          'Recovery agent ko paise na dein aur OTP, PIN, CVV ya password share na karein.',
        ],
      },
      {
        quick: 'Agar abhi cyber financial fraud me paise kate hain, turant 1930 par call karein aur National Cyber Crime Reporting Portal par report karein. Bank ke official number se unauthorized transaction report karke account secure karayein. Jaldi report helpful ho sakti hai, lekin recovery ya refund guaranteed nahi hai.',
        detail: 'Transaction ID/UTR, date-time, amount, bank messages, screenshots, phone numbers, URLs aur complaint acknowledgement sambhal kar rakhein. Money recovery ka claim karne wale kisi person ko OTP, PIN ya password na dein. RBI customer-liability rules transaction type, bank ko notification ka time, aur customer negligence/third-party breach par depend karte hain; har case me refund automatic nahi hota.',
        steps: [
          'Turant 1930 par call karein aur https://cybercrime.gov.in/ par report file/complete karein.',
          'Bank ke official app, website ya number se inform karein aur dispute register karke account/payment instrument secure karwayein.',
          'UTR/transaction ID, messages, screenshots, complaint numbers aur bank correspondence save karein.',
          'Recovery agent ko payment na karein; OTP, PIN, CVV ya password share na karein.',
        ],
      });
    return {
      quickAnswer: c.quick,
      detailedExplanation: c.detail,
      applicableLaws: [
        provision('Information Technology Act, 2000', 'Section 66C / 66D — where facts satisfy the statutory ingredients',
          'These provisions address identity theft and cheating by personation using computer resources.',
          'May be relevant to certain forms of digital impersonation or identity misuse.',
          'https://www.indiacode.nic.in/', 'The exact offence depends on what happened; not every online payment dispute falls under these sections.'),
        provision('Reserve Bank of India directions on unauthorised electronic transactions', 'Customer liability framework',
          'The applicable liability and reporting requirements depend on the transaction and facts under the relevant RBI directions.',
          'Relevant where the disputed transaction is an unauthorised electronic banking transaction.',
          RBI_URL, 'Notify the bank promptly; do not assume zero liability without checking the applicable rule and facts.'),
      ],
      immediateSteps: c.steps,
      officialSources: [
        { title: 'National Cyber Crime Reporting Portal', url: CYBER_URL, authority: 'Ministry of Home Affairs, Government of India' },
        { title: 'Reserve Bank of India', url: RBI_URL, authority: 'Reserve Bank of India' },
        { title: 'India Code — Information Technology Act, 2000', url: 'https://www.indiacode.nic.in/', authority: 'Government of India' },
      ],
      disclaimer: 'Report immediately. Recovery depends on the transaction trail and other facts; this guidance does not guarantee a freeze, recovery or bank refund.',
    };
  }

  return undefined;
}

function buildConstitutionAnswer(
  query: string,
  lang: DetectedLanguage,
  searchResult: SearchResult,
): StructuredLegalAnswer | undefined {
  if (!searchResult.constitutionArticles?.length || !/\barticle\s*\d+[a-z]?\b/i.test(query)) {
    return undefined;
  }

  const article = searchResult.constitutionArticles[0];
  const principles = Array.isArray(article.keyPrinciples) ? article.keyPrinciples : [];
  const cases = Array.isArray(article.landmarkCases) ? article.landmarkCases : [];
  const name = `${article.article} — ${article.title}`;
  const isHindi = lang === 'hindi';
  const isHinglish = lang === 'hinglish';
  const principlesText = principles.length ? principles.map((x) => `- ${x}`).join('\n') : '';
  const casesText = cases.length ? cases.map((x) => `- ${x}`).join('\n') : '';

  return {
    quickAnswer: isHindi
      ? `${name}। ${article.description}`
      : isHinglish
      ? `${name}. Is article ka summary: ${article.description}`
      : `${name}. ${article.description}`,
    detailedExplanation: [
      article.description,
      principlesText ? `${isHindi ? 'मुख्य सिद्धांत' : 'Key principles'}:\n${principlesText}` : '',
      casesText ? `${isHindi ? 'प्रमुख मामले' : 'Landmark cases'}:\n${casesText}` : '',
    ].filter(Boolean).join('\n\n'),
    applicableLaws: [
      provision('Constitution of India', article.article, article.description,
        `The query specifically refers to ${article.article}.`,
        CONSTITUTION_URL, 'Interpretation depends on the full constitutional text and relevant case law.'),
    ],
    immediateSteps: isHindi
      ? ['आधिकारिक संविधान पाठ और संबंधित निर्णय देखें।', 'यदि मामला व्यक्तिगत विवाद से जुड़ा है, तो वकील या DLSA से सलाह लें।']
      : isHinglish
      ? ['Official Constitution text aur relevant judgments check karein.', 'Personal case ke liye lawyer ya DLSA se advice lein.']
      : ['Check the official constitutional text and relevant judgments.', 'For a specific dispute, consult a qualified lawyer or DLSA.'],
    officialSources: [
      { title: 'Constitution of India', url: CONSTITUTION_URL, authority: 'Legislative Department, Government of India' },
      { title: 'India Code', url: 'https://www.indiacode.nic.in/', authority: 'Government of India' },
    ],
    disclaimer: 'General legal information only. Constitutional provisions must be read in context with applicable judgments and facts.',
  };
}

function buildGeneralAnswer(
  query: string,
  lang: DetectedLanguage,
  searchResult: SearchResult,
): StructuredLegalAnswer {
  const isHindi = lang === 'hindi';
  const isHinglish = lang === 'hinglish';
  const sections = Array.isArray(searchResult.sections) ? searchResult.sections : [];

  const applicableLaws: ApplicableProvision[] = sections.slice(0, 4).map((s) =>
    provision(
      s.act,
      `Section ${s.number}${s.ipcNumber ? ` (IPC equivalent: ${s.ipcNumber})` : ''}`,
      s.description,
      `This provision was returned by the legal knowledge search for the query: "${query}".`,
      s.officialLink || 'https://www.indiacode.nic.in/',
      'Search relevance alone does not establish that this provision applies to your facts. Verify the current statutory text and legal ingredients.',
    ),
  );

  const quickAnswer = isHindi
    ? 'आपके प्रश्न का सही उत्तर देने के लिए घटना के कुछ तथ्य और लागू कानून की पुष्टि आवश्यक है। नीचे खोज में मिले संभावित प्रावधान दिए गए हैं; इन्हें अंतिम कानूनी निष्कर्ष न मानें।'
    : isHinglish
    ? 'Aapke question ka accurate answer dene ke liye kuch facts aur applicable law verify karna zaroori hai. Neeche search me mile possible provisions hain; inhe final legal conclusion na samjhein.'
    : 'A reliable answer requires the relevant facts and verification of the applicable law. The provisions below were returned by the legal search and are candidates to check, not a conclusion that they apply.';

  return {
    quickAnswer,
    detailedExplanation: isHindi
      ? 'कानूनी परिणाम घटना, तारीख, स्थान, उपलब्ध दस्तावेज़/साक्ष्य और संबंधित कानून पर निर्भर करता है। यदि आप घटना, राज्य/शहर और यह बताएँ कि अब तक क्या कार्रवाई हुई है, तो उत्तर को अधिक सटीक बनाया जा सकता है।'
      : isHinglish
      ? 'Legal outcome incident, date, location, documents/evidence aur applicable law par depend karta hai. Incident, state/city aur ab tak kya action hua hai batane se answer zyada specific ho sakta hai.'
      : 'The legal outcome depends on the incident, date, location, available documents or evidence, and the applicable law. The answer can be made more specific with the incident details, state/city, and any action already taken.',
    applicableLaws,
    immediateSteps: isHindi
      ? ['संबंधित दस्तावेज़, संदेश, रसीदें और अन्य साक्ष्य सुरक्षित रखें।', 'समय-सीमा या तत्काल सुरक्षा का प्रश्न हो तो बिना देर किए स्थानीय वकील या विधिक सेवा प्राधिकरण से संपर्क करें।']
      : isHinglish
      ? ['Relevant documents, messages, receipts aur evidence safe rakhein.', 'Agar deadline ya immediate safety ka issue hai to local lawyer ya legal services authority se jaldi contact karein.']
      : ['Preserve relevant documents, messages, receipts and other evidence.', 'If a deadline or immediate safety issue is involved, contact a local lawyer or legal services authority promptly.'],
    officialSources: [
      { title: 'India Code — official legislation database', url: 'https://www.indiacode.nic.in/', authority: 'Government of India' },
      { title: 'National Legal Services Authority (NALSA)', url: NALSA_URL, authority: 'Government of India' },
    ],
    disclaimer: 'This is general legal information, not legal advice. Search matches may be incomplete or irrelevant; applicability must be verified against current law and the facts.',
  };
}

export function generateStructuredFallback(
  query: string,
  searchResult: SearchResult,
): {
  structured: StructuredLegalAnswer;
  text: string;
  sectionsReferenced: Section[];
  quickActions: string[];
} {
  const lang = detectLanguage(query);
  const intent = classifyIntent(query);

  const structured =
    buildIntentAnswer(query, lang, intent) ||
    buildConstitutionAnswer(query, lang, searchResult) ||
    buildGeneralAnswer(query, lang, searchResult);

  const text = formatStructuredToMarkdown(structured);
  const sectionsReferenced = Array.isArray(searchResult.sections) ? searchResult.sections : [];

  return {
    structured,
    text,
    sectionsReferenced,
    quickActions: lang === 'hindi'
      ? ['धारा का विवरण देखें', 'वकील से संपर्क करें', 'मुफ्त कानूनी सहायता']
      : lang === 'hinglish'
      ? ['Section details dekhein', 'Advocate se baat karein', 'Free Legal Aid (NALSA)']
      : ['View Section Details', 'Consult a Lawyer', 'Free Legal Aid (NALSA)'],
  };
}

export function formatStructuredToMarkdown(s: StructuredLegalAnswer): string {
  let md = `### 1. Quick Answer\n${s.quickAnswer}\n\n`;
  md += `### 2. Detailed Explanation\n${s.detailedExplanation}\n\n`;

  if (s.applicableLaws?.length) {
    md += '### 3. Applicable Laws and Sections\n';
    s.applicableLaws.forEach((law) => {
      md += `#### **${law.actName} — ${law.sectionNumber}**\n`;
      md += `- **Explanation**: ${law.explanation}\n`;
      md += `- **Why It Applies**: ${law.whyApplicable}\n`;
      if (law.conditionsOrLimitations) {
        md += `- **Conditions & Limitations**: ${law.conditionsOrLimitations}\n`;
      }
      if (law.officialSourceLink) {
        md += `- **Official Source**: [${law.actName}](${law.officialSourceLink})\n`;
      }
      md += '\n';
    });
  }

  if (s.immediateSteps?.length) {
    md += '### Immediate Practical Next Steps\n';
    s.immediateSteps.forEach((step, index) => {
      md += `${index + 1}. ${step}\n`;
    });
    md += '\n';
  }

  if (s.officialSources?.length) {
    md += '### 4. Official Sources & Portals\n';
    s.officialSources.forEach((source) => {
      md += `- [${source.title}](${source.url}) *(${source.authority})*\n`;
    });
    md += '\n';
  }

  md += `*Disclaimer: ${s.disclaimer}*`;
  return md;
}

export function generateStatutoryAnswer(
  query: string,
  searchResult: SearchResult,
): {
  text: string;
  sectionsReferenced: Section[];
  quickActions: string[];
  structured?: StructuredLegalAnswer;
} {
  return generateStructuredFallback(query, searchResult);
}
