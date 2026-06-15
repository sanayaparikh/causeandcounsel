/* ============================================================
   CAUSE & COUNSEL — mock-content.js
   Sample blog data used ONLY when the Notion proxy (/api/posts)
   isn't configured yet. Blocks are written in Notion's real shape
   so the SAME renderer in blog-post.js handles mock and live data.
   ============================================================ */
(function () {
  'use strict';

  /* ---- rich-text + block builders (Notion-shaped) ---- */
  function T(text, ann) { return { type: 'text', plain_text: text, annotations: Object.assign({ bold: false, italic: false, code: false, strikethrough: false, underline: false }, ann || {}), href: (ann && ann.href) || null }; }
  function B(t) { return T(t, { bold: true }); }
  function I(t) { return T(t, { italic: true }); }
  function C(t) { return T(t, { code: true }); }
  function L(t, href) { return T(t, { href: href }); }
  function P() { return { type: 'paragraph', paragraph: { rich_text: [].slice.call(arguments) } }; }
  function H2(t) { return { type: 'heading_2', heading_2: { rich_text: [T(t)] } }; }
  function H3(t) { return { type: 'heading_3', heading_3: { rich_text: [T(t)] } }; }
  function BUL(t) { return { type: 'bulleted_list_item', bulleted_list_item: { rich_text: Array.isArray(t) ? t : [T(t)] } }; }
  function NUM(t) { return { type: 'numbered_list_item', numbered_list_item: { rich_text: Array.isArray(t) ? t : [T(t)] } }; }
  function Q(t) { return { type: 'quote', quote: { rich_text: [T(t)] } }; }
  function DIV() { return { type: 'divider', divider: {} }; }

  /* ---- Post metadata ---- */
  var posts = [
    { slug: 'companies-act-2013-founders-guide', title: 'The Companies Act, 2013 — a founder\u2019s plain-English guide', author: 'Sanaya Parikh', date: '2026-06-12', category: 'Corporate & Startup', excerpt: 'Incorporation, director duties, and the compliance calendar that trips up every first-time founder \u2014 decoded.', readTime: '9 min read', featured: true },
    { slug: 'tenant-rights-india', title: 'Your rights as a tenant in India, explained', author: 'Aarav Mehta', date: '2026-06-08', category: 'Know Your Rights', excerpt: 'Security deposits, eviction notice periods, and what a landlord legally cannot do.', readTime: '6 min read', featured: false },
    { slug: 'fir-criminal-procedure', title: 'What actually happens when you file an FIR', author: 'Diya Sharma', date: '2026-06-03', category: 'Criminal Law', excerpt: 'From the police station to the magistrate \u2014 the first hours of the criminal process, step by step.', readTime: '7 min read', featured: false },
    { slug: 'fundamental-rights-101', title: 'Fundamental Rights, without the textbook', author: 'Kabir Rao', date: '2026-05-28', category: 'Constitutional Law', excerpt: 'Part III of the Constitution in language you can actually use \u2014 and when these rights apply.', readTime: '8 min read', featured: false },
    { slug: 'consumer-protection-2019', title: 'Refunds, returns, and the Consumer Protection Act', author: 'Diya Sharma', date: '2026-05-20', category: 'Know Your Rights', excerpt: 'The 2019 law gave online shoppers real teeth. Here\u2019s how to use them.', readTime: '5 min read', featured: false },
    { slug: 'gig-worker-rights', title: 'Do gig workers have labour rights in India?', author: 'Aarav Mehta', date: '2026-05-14', category: 'Labour Law', excerpt: 'The new labour codes name platform workers for the first time. What that does \u2014 and doesn\u2019t \u2014 mean.', readTime: '7 min read', featured: false },
    { slug: 'reading-a-judgment', title: 'How to read a court judgment without fear', author: 'Sanaya Parikh', date: '2026-05-06', category: 'Case Analyses', excerpt: 'Ratio, obiter, and citations \u2014 a field guide to making sense of any judgment.', readTime: '6 min read', featured: false },
    { slug: 'startup-equity-basics', title: 'Equity, ESOPs, and vesting for first-time founders', author: 'Kabir Rao', date: '2026-04-29', category: 'Corporate & Startup', excerpt: 'Who owns what, and why a vesting schedule is the kindest thing you can do for your co-founder.', readTime: '8 min read', featured: false },
    { slug: 'sedition-and-speech', title: 'Free speech and its limits in India', author: 'Diya Sharma', date: '2026-04-21', category: 'Legislative Commentary', excerpt: 'Article 19, reasonable restrictions, and where the line actually sits today.', readTime: '9 min read', featured: false }
  ];

  /* ---- Reusable body for posts without a hand-written article ---- */
  function genericBody(p) {
    return [
      P(T('This piece is part of the Cause & Counsel library \u2014 a growing set of explainers that take a single piece of Indian law and write it back in language anyone can act on. '), I('No jargon, no gatekeeping.')),
      H2('Why this matters'),
      P(T('The rules around '), B(p.category.toLowerCase()), T(' shape decisions people make every week \u2014 often without realising the law has anything to say about them. Knowing where you stand is the first, quiet step toward using your rights.')),
      P(T('We start from first principles, cite the bare provisions, and keep the focus on what you can actually do with the information.')),
      H2('The essentials'),
      BUL([B('Know the source. '), T('Every right traces back to a statute, a rule, or a judgment. We link them so you can read the original.')]),
      BUL([B('Mind the timelines. '), T('Notice periods and limitation windows decide outcomes more often than arguments do.')]),
      BUL([B('Keep a paper trail. '), T('Written records turn a dispute about memory into a dispute about documents \u2014 and documents win.')]),
      Q('The law is rarely the obstacle. The translation is \u2014 and translation is something a student can do.'),
      H2('Where to go next'),
      P(T('Have a question this didn\u2019t answer? '), L('Get in touch', 'contact.html'), T(' \u2014 the questions readers send us often become the next article.')),
      P(I('This explainer is general information, not legal advice. For a specific situation, consult a qualified advocate.'))
    ];
  }

  /* ---- Hand-written articles ---- */
  var articles = {
    'companies-act-2013-founders-guide': [
      P(T('You\u2019ve had the idea, found a co-founder, and someone has used the word \u201cincorporate.\u201d Suddenly the '), B('Companies Act, 2013'), T(' \u2014 470-odd sections of it \u2014 stands between you and a registered company. The good news: as a founder, you only need a working map of about a tenth of it. Here it is.')),
      H2('Step one: choosing a structure'),
      P(T('Most early-stage startups register as a '), B('Private Limited Company'), T('. It caps the number of members at 200, restricts the public transfer of shares, and \u2014 crucially \u2014 gives you '), I('limited liability'), T(': your personal assets are shielded from the company\u2019s debts.')),
      P(T('The alternatives \u2014 LLP, One Person Company, or a simple partnership \u2014 each trade something away. An LLP is lighter on compliance but harder to raise venture capital into; investors expect equity in a Pvt Ltd.')),
      H2('Step two: the people the law cares about'),
      P(T('A private company needs a minimum of '), B('two directors'), T(' and '), B('two shareholders'), T(' (they can be the same two people). At least one director must have stayed in India for 120+ days in the year \u2014 the '), C('resident director'), T(' requirement under Section 149.')),
      BUL([B('Directors'), T(' run the company and owe it fiduciary duties \u2014 Section 166 spells them out: act in good faith, avoid conflicts, don\u2019t make undue gains.')]),
      BUL([B('Shareholders'), T(' own it. Early on these overlap, but the moment you raise money or grant ESOPs, the two lists diverge.')]),
      H2('Step three: incorporation, in practice'),
      NUM([B('Get DSCs and DINs. '), T('Digital Signature Certificates for directors, and Director Identification Numbers.')]),
      NUM([B('Reserve a name'), T(' through the MCA\u2019s SPICe+ Part A.')]),
      NUM([B('File SPICe+ Part B'), T(' \u2014 the single form that bundles incorporation, PAN, TAN, EPFO, ESIC and a bank account.')]),
      NUM([B('Draft the MoA and AoA'), T(' \u2014 your company\u2019s constitution. Don\u2019t copy-paste these; the AoA governs how decisions get made.')]),
      H2('Step four: the compliance calendar'),
      P(T('This is what trips founders up. Incorporation is a day; compliance is forever. The recurring obligations that actually bite:')),
      BUL([B('INC-20A'), T(' \u2014 declaration of commencement of business, within 180 days.')]),
      BUL([B('Board meetings'), T(' \u2014 at least four a year, with no more than 120 days between two.')]),
      BUL([B('Annual filings'), T(' \u2014 AOC-4 (financials) and MGT-7 (annual return) after the AGM.')]),
      BUL([B('DIR-3 KYC'), T(' \u2014 yes, directors re-verify themselves every year.')]),
      Q('Miss these and the penalties compound daily \u2014 and a director can be disqualified. Put the dates in a calendar the day you incorporate.'),
      H2('The founder\u2019s takeaway'),
      P(T('Incorporate as a Pvt Ltd, take the director duties in Section 166 seriously, and treat the compliance calendar as non-negotiable infrastructure. Everything else you can learn as you go \u2014 or '), L('ask us', 'contact.html'), T('.')),
      P(I('This is general information, not legal advice. Engage a company secretary or advocate for your specific incorporation.'))
    ],
    'tenant-rights-india': [
      P(T('You\u2019ve signed a rent agreement, handed over a deposit that made your eyes water, and moved in. What does the law actually let your landlord do \u2014 and what can\u2019t they? Tenancy in India is governed mostly by '), B('state Rent Control Acts'), T(' and the '), B('Model Tenancy Act, 2021'), T(', which states are adopting one by one.')),
      H2('The security deposit'),
      P(T('Under the Model Tenancy Act, a residential deposit is capped at '), B('two months\u2019 rent'), T('. Many states had no cap at all before this, which is how three- and six-month demands became normal. The deposit must be '), I('refunded'), T(' when you leave, minus lawful deductions for damage \u2014 not for ordinary wear and tear.')),
      H2('Notice and eviction'),
      P(T('A landlord cannot simply tell you to leave. Eviction requires '), B('written notice'), T(' and, if contested, an order from the Rent Authority or court. Common lawful grounds include non-payment of rent, subletting without consent, or the owner\u2019s genuine need for the premises.')),
      BUL([B('Notice period'), T(' \u2014 typically the period stated in your agreement; the Model Act defaults to specific timelines.')]),
      BUL([B('No self-help eviction'), T(' \u2014 changing the locks, cutting water or power, or removing your belongings is unlawful, full stop.')]),
      H2('What a landlord legally cannot do'),
      BUL('Enter the premises without notice (usually 24 hours) except in an emergency.'),
      BUL('Withhold the deposit without itemised, lawful deductions.'),
      BUL('Increase rent mid-term in breach of the agreement.'),
      Q('The single most useful habit: get everything in writing, and photograph the property the day you move in and the day you leave.'),
      H2('If things go wrong'),
      P(T('Most states now have a '), B('Rent Authority'), T(' \u2014 a faster, cheaper forum than a civil court \u2014 for deposit and eviction disputes. Keep your agreement, payment records, and that move-in photo set, and you\u2019re in a strong position.')),
      P(I('General information, not legal advice. Tenancy law varies by state \u2014 check whether yours has adopted the Model Tenancy Act.'))
    ],
    'fir-criminal-procedure': [
      P(T('An FIR \u2014 '), B('First Information Report'), T(' \u2014 is the document that sets the criminal justice system in motion. Knowing how it works, and your rights around it, matters whether you\u2019re reporting an offence or are caught up in one.')),
      H2('What an FIR actually is'),
      P(T('Under Section 173 of the Bharatiya Nagarik Suraksha Sanhita (which replaced the CrPC), the police must register an FIR for a '), B('cognizable offence'), T(' \u2014 a serious one, like theft or assault, where they can act without a magistrate\u2019s prior permission.')),
      H2('Your rights at the police station'),
      BUL([B('Free registration. '), T('Filing an FIR costs nothing. The police cannot refuse a cognizable complaint.')]),
      BUL([B('A free copy. '), T('You are entitled to a copy of the FIR at no charge \u2014 insist on it.')]),
      BUL([B('Zero FIR. '), T('You can file at any station regardless of where the offence occurred; it is then transferred.')]),
      H2('If the police refuse'),
      NUM('Send your complaint in writing to the Superintendent of Police.'),
      NUM('If still ignored, approach the Magistrate under the relevant section, who can direct registration.'),
      Q('Refusal to register an FIR for a cognizable offence is itself a dereliction of duty \u2014 you have escalation routes, and they work.'),
      H2('What happens next'),
      P(T('The FIR triggers investigation: statements, evidence, and \u2014 if warranted \u2014 arrest, which carries its own bundle of rights (to be informed of grounds, to legal representation, to be produced before a magistrate within 24 hours).')),
      P(I('General information, not legal advice. If you are involved in a criminal matter, speak to a lawyer immediately.'))
    ]
  };

  // Fill the rest with the generic body
  posts.forEach(function (p) { if (!articles[p.slug]) articles[p.slug] = genericBody(p); });

  window.CC_MOCK = { posts: posts, articles: articles };
})();
