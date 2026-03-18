export interface CoverLetterExample {
  slug: string
  title: string
  category:
    | "Technology"
    | "Healthcare"
    | "Finance"
    | "Marketing"
    | "Education"
    | "Design"
    | "Management"
  description: string
  openingParagraph: string
  bodyParagraph: string
  closingParagraph: string
  keyPhrases: string[]
  tips: string[]
  faqs: { q: string; a: string }[]
}

export const coverLetterExamples: CoverLetterExample[] = [
  {
    slug: "software-engineer",
    title: "Software Engineer",
    category: "Technology",
    description:
      "A strong software engineer cover letter example with proven strategies for showcasing technical skills, project impact, and engineering culture fit.",
    openingParagraph:
      "I am writing to express my strong interest in the Software Engineer position at your company. With over four years of experience building scalable web applications and distributed systems, I am confident I can make an immediate impact on your engineering team. Your commitment to shipping high-quality products that millions of users rely on deeply resonates with my professional values.",
    bodyParagraph:
      "In my current role at Acme Corp, I led the migration of a monolithic Rails application to a microservices architecture using Node.js and Kubernetes, reducing deployment times by 70% and improving system reliability to 99.95% uptime. I also spearheaded the adoption of CI/CD pipelines that cut release cycles from biweekly to daily. Beyond technical execution, I mentored three junior developers and drove code review standards that decreased production bugs by 40%.",
    closingParagraph:
      "I would welcome the opportunity to discuss how my experience in full-stack development and system design can contribute to your team's goals. I am available for an interview at your earliest convenience and look forward to hearing from you.",
    keyPhrases: [
      "scalable web applications",
      "microservices architecture",
      "CI/CD pipelines",
      "code review",
      "system design",
      "cross-functional collaboration",
      "production reliability",
      "mentoring junior developers",
    ],
    tips: [
      "Quantify your impact with specific metrics like uptime percentages, latency improvements, or deployment frequency.",
      "Mention the tech stack from the job listing to pass ATS keyword filters.",
      "Show you understand the company's product and engineering culture, not just the technical requirements.",
      "Highlight collaboration and communication skills — engineering is a team sport.",
    ],
    faqs: [
      {
        q: "Should I list programming languages in my cover letter?",
        a: "Mention the languages and frameworks that directly match the job description, but weave them into accomplishments rather than listing them. For example, say 'built a real-time dashboard using React and WebSockets' instead of 'proficient in React.'",
      },
      {
        q: "How long should a software engineer cover letter be?",
        a: "Keep it to one page — ideally 250 to 400 words. Hiring managers and recruiters scan quickly, so every sentence should add value. Three to four focused paragraphs is the sweet spot.",
      },
      {
        q: "Do software engineers really need a cover letter?",
        a: "Yes. While some companies make it optional, a well-written cover letter differentiates you from equally qualified candidates. It lets you explain why you want this specific role and what you bring beyond your resume.",
      },
    ],
  },
  {
    slug: "data-analyst",
    title: "Data Analyst",
    category: "Technology",
    description:
      "An effective data analyst cover letter example demonstrating how to highlight analytical skills, data storytelling ability, and business impact.",
    openingParagraph:
      "I am excited to apply for the Data Analyst position at your organization. With three years of experience transforming raw data into actionable business insights, I bring a proven ability to bridge the gap between complex datasets and strategic decision-making. Your company's data-driven approach to product development is exactly the environment where I thrive.",
    bodyParagraph:
      "At DataDriven Inc., I built automated dashboards in Tableau that reduced weekly reporting time by 15 hours across three departments. I developed a customer churn prediction model using Python and SQL that identified at-risk accounts with 87% accuracy, directly contributing to a 12% improvement in retention. I also partnered with the marketing team to design A/B testing frameworks that optimized campaign spend by $200K annually.",
    closingParagraph:
      "I would love the opportunity to bring my analytical expertise and business acumen to your team. Please feel free to reach out to schedule a conversation — I am eager to learn more about how data drives decisions at your company.",
    keyPhrases: [
      "data visualization",
      "SQL and Python",
      "A/B testing",
      "business intelligence",
      "predictive modeling",
      "stakeholder communication",
      "dashboard automation",
      "data-driven decisions",
    ],
    tips: [
      "Showcase a specific project where your analysis directly influenced a business outcome.",
      "Mention the BI tools from the job posting (Tableau, Power BI, Looker) to match ATS keywords.",
      "Demonstrate your ability to communicate findings to non-technical stakeholders.",
      "Include metrics that prove you go beyond generating reports to driving action.",
    ],
    faqs: [
      {
        q: "What skills should I emphasize in a data analyst cover letter?",
        a: "Focus on SQL, Python or R, data visualization tools, and statistical analysis. But more importantly, emphasize your ability to translate data into business recommendations that stakeholders can act on.",
      },
      {
        q: "Should I mention specific tools and technologies?",
        a: "Absolutely. Mirror the tools listed in the job description — Tableau, Power BI, SQL, Python, Excel — but embed them in achievement statements rather than just listing them.",
      },
      {
        q: "How do I stand out without much experience?",
        a: "Highlight relevant coursework, personal projects, or Kaggle competitions. Emphasize your curiosity, learning speed, and any instance where you used data to solve a real problem, even in a non-professional setting.",
      },
    ],
  },
  {
    slug: "registered-nurse",
    title: "Registered Nurse",
    category: "Healthcare",
    description:
      "A compelling registered nurse cover letter example that showcases clinical expertise, patient-centered care, and compassion under pressure.",
    openingParagraph:
      "I am writing to apply for the Registered Nurse position at your hospital. With five years of experience in fast-paced medical-surgical units, I have developed strong clinical judgment and a deep commitment to patient-centered care. Your facility's reputation for clinical excellence and community engagement aligns perfectly with my professional goals.",
    bodyParagraph:
      "In my current role at City General Hospital, I manage a patient load of 6-8 acute care patients per shift while maintaining a 98% patient satisfaction score. I implemented a bedside handoff protocol that reduced medication errors by 25% across our unit. I also serve as a preceptor for new graduate nurses, training four new hires over the past year and helping them achieve clinical competency ahead of schedule.",
    closingParagraph:
      "I am passionate about delivering compassionate, evidence-based care and would be honored to contribute to your nursing team. I welcome the chance to discuss my qualifications further and am available for an interview at your convenience.",
    keyPhrases: [
      "patient-centered care",
      "clinical judgment",
      "evidence-based practice",
      "patient safety",
      "interdisciplinary collaboration",
      "medication administration",
      "EMR documentation",
      "preceptor experience",
    ],
    tips: [
      "Highlight specific certifications (BLS, ACLS, specialty certs) that the posting requires.",
      "Quantify your patient load, satisfaction scores, or safety improvements to show measurable impact.",
      "Demonstrate empathy and communication skills — nursing is as much about people as it is about clinical skills.",
      "Mention experience with the EMR system used at the target facility if possible.",
    ],
    faqs: [
      {
        q: "What should a new grad nurse include in a cover letter?",
        a: "Emphasize clinical rotations, capstone projects, and any patient care experience. Highlight your eagerness to learn, adaptability, and specific skills gained during preceptorships. Passion and willingness to grow can outweigh years of experience.",
      },
      {
        q: "Should I mention my nursing license number?",
        a: "You do not need to include your license number in the cover letter. Simply state that you hold an active RN license in the relevant state. The license number can be verified during the credentialing process.",
      },
      {
        q: "How important is the cover letter for nursing jobs?",
        a: "Very important. Nursing is a relationship-driven profession, and a cover letter lets you show your personality, compassion, and communication skills — qualities that a resume alone cannot fully convey.",
      },
    ],
  },
  {
    slug: "marketing-manager",
    title: "Marketing Manager",
    category: "Marketing",
    description:
      "A results-driven marketing manager cover letter example showing how to demonstrate campaign ROI, brand strategy, and leadership skills.",
    openingParagraph:
      "I am thrilled to apply for the Marketing Manager position at your company. With seven years of experience leading integrated marketing campaigns across digital and traditional channels, I have a track record of driving measurable growth and building high-performing teams. Your brand's innovative approach to customer engagement is something I am eager to contribute to.",
    bodyParagraph:
      "As Marketing Manager at BrightBrand Co., I led a team of five marketers and managed an annual budget of $1.2M. I developed a content-led SEO strategy that increased organic traffic by 180% in 12 months, generating $800K in attributed pipeline. I also launched a brand refresh initiative that improved brand awareness scores by 35% and won a regional Effie Award for campaign effectiveness.",
    closingParagraph:
      "I would love to bring my strategic thinking and hands-on execution experience to your marketing team. I am available to discuss how my background can help accelerate your growth goals and look forward to connecting soon.",
    keyPhrases: [
      "integrated marketing campaigns",
      "SEO strategy",
      "brand awareness",
      "team leadership",
      "marketing ROI",
      "content marketing",
      "budget management",
      "customer engagement",
    ],
    tips: [
      "Lead with your biggest marketing win and tie it to revenue or growth metrics.",
      "Show strategic thinking — explain why you chose a particular approach, not just what you did.",
      "Mention experience managing budgets and teams to demonstrate leadership readiness.",
      "Reference the company's recent campaigns or brand positioning to show genuine interest.",
    ],
    faqs: [
      {
        q: "Should I include marketing metrics in my cover letter?",
        a: "Absolutely. Marketing is a metrics-driven field. Include ROI figures, traffic growth percentages, conversion rates, or pipeline revenue. Concrete numbers make your accomplishments credible and memorable.",
      },
      {
        q: "How do I tailor my cover letter for different marketing roles?",
        a: "Align your examples with the role's focus. For a brand marketing role, emphasize awareness campaigns. For demand generation, highlight lead metrics. Mirror the language and KPIs from the job description.",
      },
      {
        q: "Is a creative cover letter appropriate for marketing positions?",
        a: "A touch of creativity can help you stand out, but keep it professional. A strong narrative structure with clear results is more impressive than gimmicks. Let your strategic thinking and results speak for your creativity.",
      },
    ],
  },
  {
    slug: "project-manager",
    title: "Project Manager",
    category: "Management",
    description:
      "A professional project manager cover letter example highlighting stakeholder management, delivery excellence, and methodology expertise.",
    openingParagraph:
      "I am eager to apply for the Project Manager position at your organization. With six years of experience delivering complex projects on time and within budget across technology and operations, I bring a proven ability to align cross-functional teams around shared goals. Your company's commitment to operational excellence and innovation is a natural fit for my skill set.",
    bodyParagraph:
      "At Global Solutions Inc., I managed a portfolio of five concurrent projects with combined budgets exceeding $3M. I led the successful delivery of an enterprise ERP migration that was completed two weeks ahead of schedule and 8% under budget, earning recognition from executive leadership. I introduced Agile ceremonies to a traditionally waterfall team, improving sprint velocity by 30% and reducing scope creep incidents by 50%.",
    closingParagraph:
      "I am confident that my combination of technical project management skills and people-first leadership style will add value to your team. I would welcome the chance to discuss how I can help drive your most critical initiatives forward.",
    keyPhrases: [
      "stakeholder management",
      "Agile methodology",
      "risk mitigation",
      "budget management",
      "cross-functional teams",
      "project delivery",
      "scope management",
      "PMP certified",
    ],
    tips: [
      "Emphasize projects delivered on time and within budget — this is the core metric hiring managers care about.",
      "Mention your methodology expertise (Agile, Scrum, Waterfall, hybrid) and any certifications like PMP or CSM.",
      "Highlight your stakeholder communication skills and ability to manage competing priorities.",
      "Show leadership through influence, not just authority — project managers rarely have direct reports.",
    ],
    faqs: [
      {
        q: "Should I mention PMP certification in my cover letter?",
        a: "Yes, if you have it. PMP certification signals a validated level of knowledge and commitment to the profession. Mention it early in your letter, ideally in the opening paragraph alongside your years of experience.",
      },
      {
        q: "How do I address a career change into project management?",
        a: "Focus on transferable skills like organization, stakeholder communication, timeline management, and problem-solving. Reference any projects you have led informally and any PM training or certifications you have completed.",
      },
      {
        q: "What methodology should I highlight?",
        a: "Match the job description. If they mention Agile, lead with Agile experience. If the posting is vague, highlight your flexibility with multiple methodologies and your ability to adapt your approach to the team and project needs.",
      },
    ],
  },
  {
    slug: "graphic-designer",
    title: "Graphic Designer",
    category: "Design",
    description:
      "A creative graphic designer cover letter example that balances artistic vision with business results and brand consistency.",
    openingParagraph:
      "I am excited to apply for the Graphic Designer position at your company. With four years of experience creating visual identities, marketing collateral, and digital assets, I combine strong aesthetic sensibility with a deep understanding of brand strategy. Your portfolio of bold, human-centered design work is exactly the kind of environment where I do my best creative thinking.",
    bodyParagraph:
      "At Creative Studio Lab, I designed the complete visual identity for a fintech startup launch — including logo, brand guidelines, website, and pitch deck — that helped the client secure $2M in seed funding. I also led the redesign of our agency's social media templates, increasing client engagement rates by an average of 45%. My workflow spans Adobe Creative Suite, Figma, and motion graphics in After Effects, allowing me to deliver across print and digital channels.",
    closingParagraph:
      "I would love the opportunity to bring my design skills and brand thinking to your creative team. My portfolio is available at the link in my resume, and I look forward to discussing how I can contribute to your upcoming projects.",
    keyPhrases: [
      "visual identity",
      "brand guidelines",
      "Adobe Creative Suite",
      "Figma",
      "typography",
      "responsive design",
      "creative direction",
      "print and digital",
    ],
    tips: [
      "Always reference your portfolio — a cover letter for design roles is incomplete without it.",
      "Balance creative language with business impact; show that your designs drive results.",
      "Mention the specific tools listed in the job posting (Figma, Adobe CC, Sketch, etc.).",
      "Demonstrate that you can take creative direction as well as lead it.",
    ],
    faqs: [
      {
        q: "Should I make my cover letter visually designed?",
        a: "A clean, well-formatted cover letter with good typography shows design sensibility without being gimmicky. Avoid heavy graphics — your portfolio is where to showcase visual skills. Keep the letter professional and easy to read.",
      },
      {
        q: "How important is the portfolio compared to the cover letter?",
        a: "The portfolio is your primary asset, but the cover letter contextualizes it. Use the letter to explain your creative process, highlight your best work, and show how your design thinking aligns with the company's needs.",
      },
      {
        q: "Should I mention freelance or personal projects?",
        a: "Absolutely. Freelance and personal projects demonstrate initiative, versatility, and passion. They are especially valuable if your full-time roles have been narrow in scope. Just treat them with the same professionalism as any other work.",
      },
    ],
  },
  {
    slug: "financial-analyst",
    title: "Financial Analyst",
    category: "Finance",
    description:
      "A precise financial analyst cover letter example demonstrating modeling expertise, attention to detail, and strategic financial insight.",
    openingParagraph:
      "I am writing to apply for the Financial Analyst position at your firm. With four years of experience in financial modeling, forecasting, and variance analysis, I bring a detail-oriented approach to translating complex financial data into strategic recommendations. Your firm's reputation for rigorous analysis and client-first advisory work is deeply appealing to me.",
    bodyParagraph:
      "At Meridian Capital, I built and maintained a suite of financial models supporting $500M in annual investment decisions. I developed a rolling forecast model that improved budget accuracy by 18% quarter-over-quarter, which was adopted company-wide. I also led the financial due diligence workstream for two M&A transactions totaling $75M, delivering comprehensive analyses that informed executive go/no-go decisions.",
    closingParagraph:
      "I am eager to apply my analytical rigor and financial acumen to support your team's strategic objectives. I look forward to the opportunity to discuss how my skills align with your needs and am available for an interview at your convenience.",
    keyPhrases: [
      "financial modeling",
      "variance analysis",
      "forecasting",
      "due diligence",
      "Excel and VBA",
      "strategic recommendations",
      "budget accuracy",
      "M&A analysis",
    ],
    tips: [
      "Emphasize precision and attention to detail — errors in financial analysis are costly and hiring managers know it.",
      "Quantify the scale of budgets, portfolios, or transactions you have supported.",
      "Mention advanced Excel skills, financial modeling certifications (FMVA), or CFA progress.",
      "Show that you connect numbers to strategy, not just generate reports.",
    ],
    faqs: [
      {
        q: "Should I mention CFA progress in my cover letter?",
        a: "Yes. Even if you have not completed the CFA, mentioning that you are a Level II or III candidate signals commitment to the profession and analytical rigor. It is a meaningful differentiator, especially for junior roles.",
      },
      {
        q: "How technical should my cover letter be?",
        a: "Moderately technical. Reference specific methodologies (DCF, LBO, sensitivity analysis) but explain their impact in business terms. Your cover letter should be accessible to both finance managers and HR professionals.",
      },
      {
        q: "Do I need industry-specific experience?",
        a: "It helps but is not always required. If you are changing industries, emphasize transferable analytical skills and your ability to quickly learn new domains. Show curiosity about the target industry in your letter.",
      },
    ],
  },
  {
    slug: "teacher",
    title: "Teacher",
    category: "Education",
    description:
      "An inspiring teacher cover letter example that highlights classroom management, student outcomes, and a passion for education.",
    openingParagraph:
      "I am writing to express my enthusiastic interest in the teaching position at your school. With six years of experience as a middle school science teacher, I am passionate about creating engaging, inclusive learning environments where every student can thrive. Your school's commitment to project-based learning and social-emotional development closely mirrors my own teaching philosophy.",
    bodyParagraph:
      "At Riverside Middle School, I developed a hands-on STEM curriculum that increased student science proficiency scores by 22% over two years. I implemented differentiated instruction strategies to support a diverse classroom of 30 students, including English language learners and students with IEPs. I also founded an after-school robotics club that grew from 8 to 35 members and competed at the state level.",
    closingParagraph:
      "I would be honored to bring my energy, creativity, and student-first approach to your school community. I look forward to the opportunity to discuss how I can contribute to your students' success and your school's mission.",
    keyPhrases: [
      "differentiated instruction",
      "classroom management",
      "curriculum development",
      "student outcomes",
      "project-based learning",
      "IEP accommodation",
      "formative assessment",
      "parent communication",
    ],
    tips: [
      "Show your passion for teaching and student growth — enthusiasm is a top quality administrators seek.",
      "Include measurable student outcomes like test score improvements, graduation rates, or engagement metrics.",
      "Reference the school's specific programs, values, or mission to show you have done your research.",
      "Highlight classroom management skills and your approach to diverse learners.",
    ],
    faqs: [
      {
        q: "Should I mention my teaching philosophy?",
        a: "Briefly, yes. A one-sentence mention of your core philosophy helps administrators understand your approach. Keep it concise and tied to the school's values rather than writing a full philosophy statement.",
      },
      {
        q: "How do I address gaps in required certifications?",
        a: "Be upfront if you are in the process of obtaining a certification. Mention your expected completion date and highlight any alternative credentials, endorsements, or relevant training you already hold.",
      },
      {
        q: "Is it appropriate to mention extracurricular involvement?",
        a: "Absolutely. Schools value teachers who contribute beyond the classroom. Mention clubs, coaching, tutoring, or committee work to demonstrate your commitment to the school community as a whole.",
      },
    ],
  },
  {
    slug: "sales-representative",
    title: "Sales Representative",
    category: "Management",
    description:
      "A persuasive sales representative cover letter example showcasing quota attainment, relationship building, and consultative selling skills.",
    openingParagraph:
      "I am eager to apply for the Sales Representative position at your company. With five years of experience in B2B SaaS sales and a consistent track record of exceeding quota, I thrive on building long-term client relationships and closing complex deals. Your company's innovative product and customer-centric sales approach are exactly what drew me to this opportunity.",
    bodyParagraph:
      "At TechSales Corp., I consistently exceeded my annual quota by an average of 125% over three years, generating over $2.5M in new annual recurring revenue. I developed a consultative selling framework for our team that shortened the average sales cycle by 20% and improved close rates from 18% to 28%. I also expanded our enterprise segment by landing three Fortune 500 accounts through strategic prospecting and executive relationship building.",
    closingParagraph:
      "I am confident that my hunter mentality and consultative approach will translate into strong results for your sales team. I look forward to discussing how I can contribute to your revenue goals and am ready to hit the ground running.",
    keyPhrases: [
      "quota attainment",
      "consultative selling",
      "pipeline management",
      "B2B sales",
      "relationship building",
      "CRM proficiency",
      "sales cycle optimization",
      "new business development",
    ],
    tips: [
      "Lead with your quota attainment numbers — this is the first thing sales managers look for.",
      "Use action-oriented, confident language that mirrors the energy expected of a sales professional.",
      "Mention CRM tools (Salesforce, HubSpot) and sales methodologies (MEDDIC, Challenger, SPIN).",
      "Show that you understand the company's product, market, and ideal customer profile.",
    ],
    faqs: [
      {
        q: "How do I write a cover letter if I have not hit quota?",
        a: "Focus on growth trajectory, specific wins, and skills rather than overall numbers. Highlight deals you are proud of, skills you have developed, and how you have improved over time. Honesty paired with ambition is always respected.",
      },
      {
        q: "Should a sales cover letter be aggressive or professional?",
        a: "Confident and assertive, but never aggressive. Show enthusiasm and drive while maintaining professionalism. Think of your cover letter as a warm outreach email — persuasive, personalized, and value-driven.",
      },
      {
        q: "Is it okay to mention specific revenue numbers?",
        a: "Yes, and you should. Specific revenue numbers, quota percentages, and deal sizes make your accomplishments tangible. If confidentiality is a concern, use approximate ranges or percentages instead of exact figures.",
      },
    ],
  },
  {
    slug: "product-manager",
    title: "Product Manager",
    category: "Technology",
    description:
      "A strategic product manager cover letter example demonstrating user empathy, roadmap ownership, and cross-functional leadership.",
    openingParagraph:
      "I am excited to apply for the Product Manager position at your company. With five years of experience leading product strategy from discovery through delivery, I bring a user-obsessed mindset and a data-informed approach to building products that customers love. Your product's trajectory and the team's thoughtful approach to solving real user problems is what drew me to this role.",
    bodyParagraph:
      "At ProductFirst Inc., I owned the roadmap for a B2B collaboration platform serving 50K monthly active users. I led the discovery and launch of a real-time co-editing feature that drove a 40% increase in user engagement and reduced churn by 15%. I partnered closely with engineering, design, and sales to prioritize ruthlessly, shipping 12 major features in 18 months while maintaining a 4.6-star app rating.",
    closingParagraph:
      "I would love the opportunity to bring my product sense and execution rigor to your team. I am eager to learn more about your product challenges and discuss how my experience can help accelerate your roadmap.",
    keyPhrases: [
      "product roadmap",
      "user research",
      "data-driven decisions",
      "cross-functional leadership",
      "feature prioritization",
      "product-market fit",
      "OKRs and KPIs",
      "stakeholder alignment",
    ],
    tips: [
      "Show that you start with the user problem, not the solution — PMs are hired for product thinking.",
      "Quantify product outcomes (engagement, retention, revenue) rather than just listing features shipped.",
      "Demonstrate cross-functional influence and your ability to say no strategically.",
      "Reference the company's product and articulate a genuine perspective on its direction.",
    ],
    faqs: [
      {
        q: "Do I need a technical background to be a product manager?",
        a: "Not necessarily, but you need to be technically fluent. Your cover letter should show that you can collaborate effectively with engineers, understand trade-offs, and make informed decisions about technical investments.",
      },
      {
        q: "How do I show product sense in a cover letter?",
        a: "Describe a product decision you made, why you made it, and what the outcome was. The best answers show user empathy, data usage, and trade-off thinking. Even a brief example demonstrates your product instincts.",
      },
      {
        q: "Should I mention side projects or products I have built?",
        a: "Yes, especially if you are transitioning into product management. Side projects show initiative, user empathy, and end-to-end product thinking. Even small projects demonstrate that you understand the full product lifecycle.",
      },
    ],
  },
  {
    slug: "ux-designer",
    title: "UX Designer",
    category: "Design",
    description:
      "A user-focused UX designer cover letter example highlighting research methods, design process, and measurable usability improvements.",
    openingParagraph:
      "I am writing to apply for the UX Designer position at your company. With four years of experience in user-centered design, I specialize in turning complex user problems into intuitive, accessible digital experiences. Your team's dedication to research-driven design and inclusive product thinking is exactly the culture where I want to grow and contribute.",
    bodyParagraph:
      "At DesignForward Agency, I led the end-to-end redesign of a healthcare patient portal that serves 200K users. Through contextual inquiry and usability testing, I identified key pain points and redesigned the appointment booking flow, reducing task completion time by 55% and support tickets by 30%. I also established a component-based design system in Figma that improved designer-developer handoff efficiency by 40% across four product teams.",
    closingParagraph:
      "I would be thrilled to bring my research-driven design approach to your product team. I am eager to discuss how my process and portfolio align with your design challenges, and I welcome the opportunity to connect.",
    keyPhrases: [
      "user research",
      "usability testing",
      "design systems",
      "wireframing and prototyping",
      "accessibility standards",
      "Figma",
      "information architecture",
      "user journey mapping",
    ],
    tips: [
      "Emphasize your design process (research, ideation, testing, iteration) — not just visual output.",
      "Link to your portfolio and reference a specific case study that matches the role's domain.",
      "Mention accessibility and inclusive design to signal awareness of modern UX standards.",
      "Show that you collaborate deeply with engineers and product managers, not just other designers.",
    ],
    faqs: [
      {
        q: "Should I describe my design process in the cover letter?",
        a: "Briefly, yes. A concise mention of your approach — such as 'I start with user research, prototype rapidly, and validate through testing' — shows hiring managers how you think. Save the deep dive for the interview.",
      },
      {
        q: "How important is a portfolio for UX roles?",
        a: "Essential. Your cover letter should point to specific case studies in your portfolio. Hiring managers will review your portfolio closely, so the cover letter's job is to provide context and spark interest.",
      },
      {
        q: "Do I need to know how to code as a UX designer?",
        a: "It is not required, but familiarity with HTML, CSS, and front-end frameworks strengthens your candidacy. In your cover letter, mention any technical skills that help you collaborate more effectively with developers.",
      },
    ],
  },
  {
    slug: "human-resources-manager",
    title: "Human Resources Manager",
    category: "Management",
    description:
      "A people-first HR manager cover letter example demonstrating talent strategy, employee engagement, and organizational development expertise.",
    openingParagraph:
      "I am excited to apply for the Human Resources Manager position at your company. With eight years of progressive HR experience spanning talent acquisition, employee relations, and organizational development, I am passionate about building workplaces where people do their best work. Your company's emphasis on culture and employee wellbeing strongly resonates with my professional mission.",
    bodyParagraph:
      "At PeopleFirst Corp., I managed all HR functions for a 400-person organization across three offices. I redesigned the onboarding program, reducing new hire time-to-productivity by 30% and improving 90-day retention from 78% to 94%. I also led the implementation of a performance management system that replaced annual reviews with quarterly check-ins, resulting in a 25-point increase in employee engagement scores within one year.",
    closingParagraph:
      "I would welcome the opportunity to bring my strategic HR expertise and people-centered leadership to your organization. I look forward to discussing how I can help strengthen your team and culture.",
    keyPhrases: [
      "talent acquisition",
      "employee engagement",
      "performance management",
      "organizational development",
      "HRIS systems",
      "compliance and policy",
      "diversity and inclusion",
      "change management",
    ],
    tips: [
      "Show that you balance strategic thinking with day-to-day HR operations.",
      "Quantify HR outcomes — retention rates, engagement scores, time-to-fill, and cost-per-hire all resonate.",
      "Demonstrate knowledge of employment law and compliance relevant to the company's industry.",
      "Highlight your ability to be a trusted advisor to both leadership and employees.",
    ],
    faqs: [
      {
        q: "Should I mention specific HRIS or ATS platforms?",
        a: "Yes, mention platforms you have used (Workday, BambooHR, Greenhouse, etc.), especially if they match the job description. This demonstrates hands-on capability and helps pass ATS keyword screening.",
      },
      {
        q: "How do I address HR certifications like SHRM-CP or PHR?",
        a: "Mention them prominently. HR certifications validate your expertise and are often listed as preferred qualifications. If you are in progress, note your expected certification date.",
      },
      {
        q: "What tone should an HR cover letter have?",
        a: "Warm, professional, and empathetic. HR professionals are the face of the company's culture, so your cover letter should reflect the interpersonal skills and emotional intelligence that define great HR leaders.",
      },
    ],
  },
  {
    slug: "content-marketing-specialist",
    title: "Content Marketing Specialist",
    category: "Marketing",
    description:
      "A compelling content marketing specialist cover letter example showcasing SEO writing, content strategy, and audience engagement skills.",
    openingParagraph:
      "I am thrilled to apply for the Content Marketing Specialist position at your company. With four years of experience creating high-performing content across blog, email, and social channels, I specialize in turning brand stories into search traffic and qualified leads. Your company's content-first approach to growth marketing is exactly the challenge I am looking for.",
    bodyParagraph:
      "At ContentEngine Co., I managed the editorial calendar and published 120+ blog posts that drove a 200% increase in organic traffic within 18 months. I developed a pillar-cluster SEO strategy that ranked 15 target keywords on Google's first page, generating 40% of the marketing team's qualified leads. I also launched a weekly newsletter that grew from 0 to 12K subscribers with a consistent 35% open rate.",
    closingParagraph:
      "I am eager to bring my content strategy skills and editorial execution to your marketing team. I would love to discuss how I can help amplify your brand's voice and drive measurable growth through content.",
    keyPhrases: [
      "SEO content strategy",
      "editorial calendar",
      "organic traffic growth",
      "pillar-cluster model",
      "email marketing",
      "content performance analytics",
      "brand voice",
      "lead generation",
    ],
    tips: [
      "Include specific traffic, ranking, or lead generation metrics from your content work.",
      "Mention SEO tools (Ahrefs, SEMrush, Google Search Console) and CMS platforms you have used.",
      "Show that you understand the full content funnel — from awareness to conversion.",
      "Write your cover letter itself as a sample of your writing quality and voice.",
    ],
    faqs: [
      {
        q: "Should my cover letter double as a writing sample?",
        a: "In a sense, yes. Hiring managers will judge your writing quality based on the cover letter itself. Make every sentence purposeful, use clean structure, and demonstrate the editorial polish you bring to professional content.",
      },
      {
        q: "How do I show SEO knowledge in a cover letter?",
        a: "Reference specific SEO strategies and results — keyword rankings, organic traffic growth, domain authority improvements. Mentioning tools like Ahrefs or SEMrush signals hands-on experience with technical SEO.",
      },
      {
        q: "Is it important to mention social media skills?",
        a: "If the role includes social media, absolutely. Mention platforms you have managed, engagement metrics, and any community-building experience. Content marketing increasingly overlaps with social strategy.",
      },
    ],
  },
  {
    slug: "business-analyst",
    title: "Business Analyst",
    category: "Technology",
    description:
      "A detailed business analyst cover letter example demonstrating requirements gathering, process improvement, and stakeholder collaboration.",
    openingParagraph:
      "I am writing to apply for the Business Analyst position at your organization. With five years of experience bridging business needs and technical solutions, I excel at translating complex requirements into clear, actionable specifications. Your company's focus on digital transformation and process optimization aligns perfectly with my expertise and career aspirations.",
    bodyParagraph:
      "At Enterprise Solutions Group, I led requirements gathering for a $2M CRM implementation that unified sales, marketing, and support workflows for 500 users. I created detailed process maps and user stories that reduced development rework by 35%, keeping the project on schedule. I also identified and documented a workflow automation opportunity that saved the operations team 20 hours per week, resulting in $150K in annual cost savings.",
    closingParagraph:
      "I am eager to bring my analytical mindset and stakeholder management skills to your team. I welcome the opportunity to discuss how my experience can help drive your strategic initiatives and look forward to connecting.",
    keyPhrases: [
      "requirements gathering",
      "process mapping",
      "user stories",
      "stakeholder management",
      "data analysis",
      "workflow optimization",
      "Agile methodology",
      "business process improvement",
    ],
    tips: [
      "Demonstrate your ability to translate between business stakeholders and technical teams.",
      "Show examples of requirements you gathered that led to successful project outcomes.",
      "Mention relevant tools like Jira, Confluence, Visio, or SQL that match the job posting.",
      "Highlight both analytical skills and soft skills like facilitation, communication, and negotiation.",
    ],
    faqs: [
      {
        q: "What distinguishes a business analyst cover letter from a data analyst cover letter?",
        a: "Business analyst letters emphasize requirements gathering, process improvement, and stakeholder facilitation, while data analyst letters focus on data analysis, visualization, and statistical methods. Tailor your examples to match the role's primary focus.",
      },
      {
        q: "Should I mention technical skills like SQL?",
        a: "Yes, if the job description lists them. Technical skills like SQL, Excel, and BI tools strengthen your candidacy. Embed them in accomplishment statements to show practical application rather than just theoretical knowledge.",
      },
      {
        q: "How do I show business acumen in a cover letter?",
        a: "Connect your analytical work to business outcomes — cost savings, revenue growth, efficiency gains, or risk reduction. Showing that you understand the commercial impact of your work sets you apart from purely technical candidates.",
      },
    ],
  },
  {
    slug: "executive-assistant",
    title: "Executive Assistant",
    category: "Management",
    description:
      "A polished executive assistant cover letter example showcasing organizational excellence, discretion, and C-suite support experience.",
    openingParagraph:
      "I am writing to apply for the Executive Assistant position at your company. With six years of experience supporting C-level executives in fast-paced environments, I bring exceptional organizational skills, discretion, and a proactive approach to executive support. Your company's rapid growth and dynamic leadership team present exactly the kind of high-impact role where I excel.",
    bodyParagraph:
      "As Executive Assistant to the CEO and CFO at VelocityTech, I managed complex calendars, coordinated international travel across 12 time zones, and prepared board meeting materials for quarterly presentations. I streamlined the executive reporting process by creating automated templates that saved 10 hours per month. I also planned and executed a 200-person company offsite under budget, receiving recognition from the leadership team for flawless logistics.",
    closingParagraph:
      "I am confident that my organizational excellence and anticipatory approach to executive support will make an immediate impact. I look forward to the opportunity to discuss how I can help your leadership team operate at peak efficiency.",
    keyPhrases: [
      "calendar management",
      "travel coordination",
      "board meeting preparation",
      "executive communication",
      "expense reporting",
      "event planning",
      "confidentiality and discretion",
      "process optimization",
    ],
    tips: [
      "Emphasize discretion and confidentiality — trust is the foundation of the EA-executive relationship.",
      "Show that you are proactive, not just reactive — anticipating needs is what sets great EAs apart.",
      "Mention proficiency with specific tools (Google Workspace, Microsoft Office, Slack, travel platforms).",
      "Quantify your impact with metrics like time saved, events coordinated, or processes streamlined.",
    ],
    faqs: [
      {
        q: "How formal should an executive assistant cover letter be?",
        a: "Quite formal. The EA role requires polished communication skills, and your cover letter is a direct demonstration of that ability. Use professional language, perfect grammar, and a structured format.",
      },
      {
        q: "Should I mention the specific executives I have supported?",
        a: "Mention their titles (CEO, CFO, VP) but not their names unless they are public figures and you have permission. This shows the level at which you have operated without compromising confidentiality.",
      },
      {
        q: "Is it important to highlight technical skills?",
        a: "Yes. Modern EAs are expected to be tech-savvy. Mention proficiency with productivity suites, project management tools, expense platforms, and any automation skills that increase efficiency.",
      },
    ],
  },
]

export function getCoverLetterBySlug(
  slug: string
): CoverLetterExample | undefined {
  return coverLetterExamples.find((e) => e.slug === slug)
}
