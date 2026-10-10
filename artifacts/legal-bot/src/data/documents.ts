import { DocumentTemplate } from './types';

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'rent-agreement',
    title: 'Residential Rental Agreement (11 Months)',
    category: 'Property & Real Estate',
    description: 'Standard 11-month residential lease format compliant with State Rent Control Acts and Transfer of Property Act 1882, excluding mandatory registration requirements for tenancies under 1 year.',
    requiredFields: ['Landlord Name & Address', 'Tenant Name & Address', 'Property Schedule', 'Monthly Rent & Due Date', 'Security Deposit Amount', 'Notice Period'],
    keyClauses: ['Term of 11 months', 'Refundable Security Deposit within 15 days of vacation', '1 Month Notice for early termination', 'Prohibition of Sub-letting', 'Maintenance & Utility Bills allocation'],
    sampleDraft: `RENT AGREEMENT

This Rent Agreement is made and executed on this [Day] day of [Month], [Year] at [City], by and between:

[Landlord Name], S/o [Father Name], residing at [Landlord Address] (hereinafter called the "FIRST PARTY / LESSOR");
AND
[Tenant Name], S/o [Father Name], residing at [Tenant Permanent Address] (hereinafter called the "SECOND PARTY / LESSEE").

WHEREAS the First Party is the lawful owner of residential property situated at [Full Property Address] (hereinafter called the "DEMISED PREMISES").

NOW THIS AGREEMENT WITNESSETH AS FOLLOWS:
1. TENANCY PERIOD: The tenancy shall be for a fixed term of 11 (Eleven) months commencing from [Start Date] to [End Date].
2. MONTHLY RENT: The Lessee agrees to pay a monthly rent of Rs. [Amount in Figures]/- (Rupees [Amount in Words] only), payable in advance on or before the [Due Date, e.g., 5th] day of each English calendar month.
3. SECURITY DEPOSIT: The Lessee has deposited an interest-free refundable security deposit of Rs. [Deposit Amount]/- with the Lessor. The same shall be refunded at the time of handing over vacant physical possession, after deducting unpaid electricity/water dues or verified physical damages.
4. NOTICE PERIOD: Either party may terminate this agreement by serving 1 (One) month prior written notice to the other party.
5. NO SUB-LETTING: The Lessee shall not sub-let or assign the premises to any third party.
6. GOVERNING LAW: This agreement shall be governed by the laws of India and subject to the exclusive jurisdiction of the civil courts at [City].

IN WITNESS WHEREOF, the parties hereto have signed this agreement on the day, month, and year first written above.

FIRST PARTY (Lessor)                 SECOND PARTY (Lessee)
___________________                  ____________________

WITNESS 1: ________________          WITNESS 2: ________________`,
  },
  {
    id: 'nda-agreement',
    title: 'Mutual Non-Disclosure Agreement (NDA)',
    category: 'Corporate & Commercial',
    description: 'Protects proprietary business data, trade secrets, software source code, and commercial negotiations between two disclosing parties under Indian Contract Act 1872.',
    requiredFields: ['Disclosing Party Name', 'Receiving Party Name', 'Purpose of Disclosure', 'Term of Confidentiality (e.g. 2 or 3 years)', 'Jurisdiction City'],
    keyClauses: ['Definition of Confidential Information', 'Standard of Care (Reasonable Commercial Care)', 'Permitted Disclosures (Legal compulsion)', 'Return/Destruction of Materials', 'Injunctive Relief entitlement'],
    sampleDraft: `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of [Date] by and between:
[Party A Name], having its principal place of business at [Party A Address]; and
[Party B Name], having its principal place of business at [Party B Address].

1. PURPOSE: The parties wish to explore a potential business collaboration regarding [Purpose/Project Name].
2. CONFIDENTIAL INFORMATION: Includes all non-public technical, financial, or commercial information disclosed by either party, whether in writing, oral, or electronic form.
3. OBLIGATIONS: The Receiving Party shall hold all Confidential Information in strict confidence, using the same degree of care it uses for its own confidential data, and shall not disclose it without prior written consent.
4. TERM: This confidentiality obligation shall survive for a period of [e.g. 2 (Two) years] from the date of disclosure.
5. JURISDICTION: This Agreement shall be governed by the laws of India, and disputes shall be resolved through Arbitration in [City] under the Arbitration and Conciliation Act, 1996.

PARTY A: ____________________         PARTY B: ____________________`,
  },
  {
    id: 'legal-notice-138',
    title: 'Statutory Legal Notice under Section 138 NI Act (Cheque Bounce)',
    category: 'Commercial Litigation',
    description: 'Mandatory statutory 15-day demand notice required to be served upon the cheque drawer within 30 days of receiving the bank memo of dishonour, prior to filing a Section 138 criminal complaint.',
    requiredFields: ['Drawer Name & Address', 'Payee Name', 'Cheque Number & Date', 'Cheque Amount', 'Bank Name & Memo Date', 'Reason for Dishonour'],
    keyClauses: ['Narration of legally enforceable debt/liability', 'Presentation within validity period', 'Bank return memo details', '15-Day statutory demand for payment', 'Warning of criminal complaint under Section 138 NI Act & Section 318 BNS (420 IPC)'],
    sampleDraft: `REGISTERED A.D. / SPEED POST
LEGAL NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881

Date: [Notice Date]

To,
[Drawer Name]
[Drawer Full Address]

Sir/Madam,

Under instructions from and on behalf of my client [Payee Name], residing at [Payee Address], I hereby serve upon you this Statutory Legal Notice:

1. That in discharge of your legally enforceable debt/liability, you issued in favor of my client Cheque No. [Cheque No.] dated [Cheque Date] drawn on [Bank Name, Branch] for an amount of Rs. [Amount]/-.
2. That my client presented the said cheque for encashment through their bankers [Payee Bank Name], but the same was returned unpaid with the bank memo dated [Memo Date] with the remarks "[Funds Insufficient / Account Closed / Stop Payment]".
3. That my client received the dishonour memo on [Receipt Date], and this notice is issued within the mandatory 30-day statutory limitation period.

NOW THEREFORE, you are hereby called upon to pay the cheque amount of Rs. [Amount]/- to my client within 15 (Fifteen) days from the date of receipt of this notice. Failing this, my client will be constrained to initiate criminal proceedings against you under Section 138 of the Negotiable Instruments Act, 1881 and Section 318 of Bharatiya Nyaya Sanhita, 2023 at your sole cost and consequence.

Copy kept for court record.

Yours faithfully,
[Advocate Name], Advocate
Bar Council No: [Bar Council ID]
Office: [Advocate Address]`,
  },
  {
    id: 'general-power-attorney',
    title: 'General Power of Attorney (GPA) for Property Management',
    category: 'Property & Civil',
    description: 'Empowers an attorney/agent to represent the principal in property maintenance, utility management, tenant liaison, and civic tax payments without transferring title ownership.',
    requiredFields: ['Principal Full Details', 'Attorney Full Details', 'Property Details', 'Specific Authorized Powers'],
    keyClauses: ['Scope of management powers', 'Revocability clause', 'Prohibition of unauthorized conveyance/sale', 'Indemnity for acts done in good faith'],
    sampleDraft: `GENERAL POWER OF ATTORNEY

KNOW ALL MEN BY THESE PRESENTS that I, [Principal Name], residing at [Principal Address], do hereby nominate, constitute and appoint [Attorney Name], residing at [Attorney Address], as my true and lawful Attorney-in-fact to act for me and in my name regarding my property situated at [Property Schedule]:

1. To manage, supervise, and oversee the general maintenance of the said property.
2. To pay all property taxes, electricity, water, and municipal assessments.
3. To represent me before civic authorities, municipal corporations, and utility departments.
4. PROVIDED THAT this power of attorney does NOT authorize the attorney to sell, mortgage, gift, or create any third-party encumbrance over the property.

IN WITNESS WHEREOF, I have executed this General Power of Attorney on this [Date] at [City].

EXECUTANT (Principal): ____________________
ACCEPTED (Attorney):   ____________________`,
  },
];
