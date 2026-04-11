export interface AtsKeywordsData {
  slug: string
  title: string
  category: string
  description: string
  hardSkills: string[]
  softSkills: string[]
  certifications: string[]
  actionVerbs: string[]
  jobTitles: string[]
  industryTerms: string[]
  tips: string[]
  faqs: { q: string; a: string }[]
}

export const atsKeywordsData: AtsKeywordsData[] = [
  {
    slug: "software-engineer",
    title: "Software Engineer",
    category: "Technology",
    description: "The most important ATS keywords for software engineer resumes in 2026. Include these hard skills, tools, and action verbs to pass applicant tracking systems.",
    hardSkills: ["Python", "JavaScript", "TypeScript", "React", "Node.js", "Java", "Go", "SQL", "PostgreSQL", "MongoDB", "Redis", "REST API", "GraphQL", "Docker", "Kubernetes", "AWS", "CI/CD", "Git", "Terraform", "Microservices"],
    softSkills: ["Cross-functional collaboration", "Technical mentorship", "Problem-solving", "Code review", "Agile methodology", "Stakeholder communication", "Self-directed learning", "Attention to detail"],
    certifications: ["AWS Certified Solutions Architect", "Certified Kubernetes Administrator (CKA)", "Google Professional Cloud Developer", "Microsoft Azure Developer Associate", "HashiCorp Terraform Associate"],
    actionVerbs: ["Architected", "Engineered", "Implemented", "Optimized", "Deployed", "Refactored", "Debugged", "Designed", "Scaled", "Automated", "Migrated", "Developed"],
    jobTitles: ["Software Engineer", "Senior Software Engineer", "Backend Engineer", "Full Stack Engineer", "Software Developer", "Platform Engineer", "Site Reliability Engineer"],
    industryTerms: ["System design", "Distributed systems", "Event-driven architecture", "Object-oriented programming", "Test-driven development", "Agile/Scrum", "Technical debt", "Code coverage", "Latency optimization", "Horizontal scaling", "Infrastructure as code", "Observability"],
    tips: [
      "Mirror the exact technology names from the job description — 'AWS Lambda' beats 'cloud functions' for ATS matching.",
      "Include both the full name and the acronym for certifications and methodologies: 'Continuous Integration/Continuous Deployment (CI/CD)'.",
      "List languages and frameworks in a dedicated technical skills section so ATS parsers can extract them reliably.",
      "Weave action verbs into bullet points with quantified metrics: 'Reduced API latency by 60% by implementing Redis caching.'",
    ],
    faqs: [
      {
        q: "How many keywords should a software engineer resume include?",
        a: "Focus on 15-25 highly relevant keywords rather than stuffing every possible term. Quality and context matter more than quantity — ATS systems increasingly score for relevance, not just presence.",
      },
      {
        q: "Should I list every programming language I know?",
        a: "No. Prioritize languages and frameworks from the job description and list secondary skills under a 'Familiar With' section. A resume with 20 languages and no depth looks less credible than one with 8 languages demonstrated through real projects.",
      },
      {
        q: "Do ATS systems read skills listed in tables or columns?",
        a: "Many older ATS systems fail to parse tables and multi-column layouts correctly, misreading or skipping content. Use a simple single-column layout with a plain text skills section for maximum ATS compatibility.",
      },
    ],
  },
  {
    slug: "data-analyst",
    title: "Data Analyst",
    category: "Data & Analytics",
    description: "Essential ATS keywords for data analyst resumes. Optimize your resume with the SQL, visualization, and analytics keywords hiring managers are searching for.",
    hardSkills: ["SQL", "Python", "Excel", "Tableau", "Power BI", "R", "Google Analytics", "Looker", "Apache Airflow", "Snowflake", "BigQuery", "Pandas", "NumPy", "ETL", "Data modeling", "A/B testing", "Statistical analysis", "Data warehousing", "Matplotlib", "Seaborn"],
    softSkills: ["Data storytelling", "Stakeholder communication", "Analytical thinking", "Business acumen", "Attention to detail", "Collaboration", "Presentation skills", "Curiosity"],
    certifications: ["Google Data Analytics Professional Certificate", "Tableau Desktop Specialist", "Microsoft Certified: Data Analyst Associate (Power BI)", "IBM Data Analyst Professional Certificate", "Coursera/DataCamp certifications"],
    actionVerbs: ["Analyzed", "Visualized", "Automated", "Transformed", "Queried", "Modeled", "Reported", "Forecasted", "Identified", "Segmented", "Optimized", "Designed"],
    jobTitles: ["Data Analyst", "Senior Data Analyst", "Business Analyst", "Marketing Analyst", "Financial Analyst", "Operations Analyst", "Analytics Engineer"],
    industryTerms: ["Business intelligence (BI)", "Key performance indicators (KPIs)", "Dashboard", "Data pipeline", "Ad hoc analysis", "Cohort analysis", "Funnel analysis", "Customer segmentation", "Predictive modeling", "Data governance", "Data quality", "Root cause analysis"],
    tips: [
      "SQL is the most-searched skill in data analyst job descriptions — ensure it appears multiple times in context, not just in the skills section.",
      "Name specific tools: 'Tableau' beats 'data visualization tools.' Recruiters search for exact product names.",
      "Include data scale metrics in bullets: 'Processed 10M+ daily records' shows you've worked at meaningful scale.",
      "List industry-specific data types you've worked with (clickstream data, transactional data, survey data) to match specialized job descriptions.",
    ],
    faqs: [
      {
        q: "Is Python or R more important for a data analyst resume?",
        a: "Python is more widely required and should be listed first. R is valued in academic research, pharma, and statistics-heavy roles. If the job description mentions R specifically, include it prominently. Most roles prioritize Python + SQL.",
      },
      {
        q: "Should I list Excel on a data analyst resume?",
        a: "Yes. Excel is still widely used and often explicitly required. List it with specific functions: VLOOKUP, pivot tables, Power Query. Don't assume employers will infer Excel proficiency from Python skills.",
      },
      {
        q: "How do I show data analyst keywords when my experience is from personal projects?",
        a: "Include a dedicated 'Projects' section listing the dataset, tools used, and the analysis or insight produced. Kaggle competitions, public datasets, and personal dashboards count as legitimate experience for early-career analysts.",
      },
    ],
  },
  {
    slug: "product-manager",
    title: "Product Manager",
    category: "Management",
    description: "Top ATS keywords for product manager resumes in 2026. Include these strategy, metrics, and process terms to pass ATS filters at tech and consumer companies.",
    hardSkills: ["Product roadmap", "Agile/Scrum", "JIRA", "Confluence", "SQL", "A/B testing", "User research", "Wireframing", "Figma", "Product analytics", "OKRs", "Go-to-market strategy", "API product management", "Backlog prioritization", "Sprint planning"],
    softSkills: ["Cross-functional leadership", "Stakeholder alignment", "Strategic thinking", "Customer empathy", "Data-driven decision making", "Executive communication", "Conflict resolution", "Prioritization"],
    certifications: ["Certified Scrum Product Owner (CSPO)", "Product Management Certificate (Pragmatic Institute)", "Google Project Management Certificate", "AWS Cloud Practitioner (for technical PM roles)"],
    actionVerbs: ["Launched", "Defined", "Prioritized", "Shipped", "Drove", "Led", "Aligned", "Designed", "Increased", "Reduced", "Collaborated", "Delivered"],
    jobTitles: ["Product Manager", "Senior Product Manager", "Principal Product Manager", "Group Product Manager", "Technical Product Manager", "Product Lead", "Director of Product"],
    industryTerms: ["Product-market fit", "User story", "Acceptance criteria", "MVP (minimum viable product)", "Product lifecycle", "Feature flagging", "North star metric", "DAU/MAU", "Net Promoter Score (NPS)", "Customer journey mapping", "Opportunity sizing", "Discovery and delivery"],
    tips: [
      "Include metrics tied to products you've shipped: 'Increased DAU by 35%' and 'Reduced churn by 18%' are high-signal ATS and recruiter magnets.",
      "List the specific Agile ceremonies you run: sprint planning, backlog grooming, retrospectives, demos — these are keyword-searchable.",
      "Tailor to the company type: B2B PM resumes should emphasize enterprise features and sales cycles; B2C should highlight growth metrics and consumer research.",
      "Include SQL and analytics tools — technical PMs are increasingly preferred and these keywords filter for that profile.",
    ],
    faqs: [
      {
        q: "Do product manager resumes need technical keywords?",
        a: "Increasingly yes. Technical PM roles explicitly require SQL, API knowledge, or engineering background. Even non-technical PM roles benefit from data analysis keywords since PMs are expected to self-serve analytics and make data-driven decisions.",
      },
      {
        q: "What's the best format for a product manager resume?",
        a: "A single-page resume for under 10 years of experience. Lead with a 3-line summary, then product experience with quantified bullets, then skills and education. Many PMs include a 'Products Shipped' section to make their portfolio immediately visible.",
      },
      {
        q: "Should a PM resume list specific products by name?",
        a: "Yes, when publicly available. Naming products you've shipped (even internally) shows concrete output. If the product is confidential, describe it by category and scale: 'B2B SaaS analytics dashboard serving 50K enterprise users.'",
      },
    ],
  },
  {
    slug: "data-scientist",
    title: "Data Scientist",
    category: "Data & Analytics",
    description: "Critical ATS keywords for data scientist resumes. Cover machine learning, statistics, and programming skills that applicant tracking systems scan for.",
    hardSkills: ["Python", "R", "SQL", "Machine learning", "Deep learning", "TensorFlow", "PyTorch", "scikit-learn", "Pandas", "NumPy", "Spark", "Hadoop", "Jupyter", "Feature engineering", "Natural language processing (NLP)", "Computer vision", "Statistical modeling", "XGBoost", "Neural networks", "MLflow"],
    softSkills: ["Research mindset", "Intellectual curiosity", "Business acumen", "Data storytelling", "Cross-functional collaboration", "Scientific communication", "Problem framing", "Attention to detail"],
    certifications: ["TensorFlow Developer Certificate", "AWS Certified Machine Learning Specialty", "Google Professional Machine Learning Engineer", "Databricks Certified Associate Developer for Apache Spark", "DeepLearning.AI specializations"],
    actionVerbs: ["Built", "Trained", "Deployed", "Modeled", "Predicted", "Optimized", "Analyzed", "Researched", "Developed", "Evaluated", "Implemented", "Automated"],
    jobTitles: ["Data Scientist", "Senior Data Scientist", "Machine Learning Scientist", "Applied Scientist", "Research Scientist", "ML Engineer", "AI Engineer"],
    industryTerms: ["Supervised learning", "Unsupervised learning", "Reinforcement learning", "Gradient boosting", "Random forest", "Model evaluation", "Cross-validation", "Hyperparameter tuning", "A/B testing", "Experiment design", "Data pipeline", "Model deployment", "MLOps", "Embeddings"],
    tips: [
      "Include the ML framework from the job description prominently — 'PyTorch' and 'TensorFlow' are both commonly ATS-searched and not interchangeable.",
      "Quantify model performance: 'Achieved 94% AUC-ROC' and 'Reduced prediction latency from 850ms to 120ms' are memorable and ATS-optimized.",
      "List domain-specific experience: NLP, computer vision, time series, or recommendation systems — this filters for specialized roles.",
      "Include production deployment experience if you have it — 'deployed to production' or 'serving 1M+ daily predictions' differentiates academic projects from real-world experience.",
    ],
    faqs: [
      {
        q: "What is the difference between a data scientist and ML engineer resume?",
        a: "Data scientist resumes emphasize statistical analysis, model building, and business insights. ML engineer resumes emphasize production engineering: model serving, pipeline development, MLOps, and system scalability. Tailor based on where you sit on the research-to-engineering spectrum.",
      },
      {
        q: "Should data scientists list Kaggle rankings on their resume?",
        a: "Yes, if you're in the top 10-15% or have won a competition. Include your ranking percentile or specific competition achievement. Kaggle demonstrates self-directed learning and practical ML ability, which is valuable for early-career data scientists without extensive work experience.",
      },
      {
        q: "How technical should a data scientist resume be?",
        a: "Very technical — but always tied to outcomes. Don't just list algorithms; show the business problem each model solved. 'Built churn prediction model (XGBoost, 89% AUC) that identified $2.3M at-risk ARR quarterly' is stronger than 'developed machine learning models.'",
      },
    ],
  },
  {
    slug: "devops-engineer",
    title: "DevOps Engineer",
    category: "Technology",
    description: "Top ATS keywords for DevOps engineer resumes. Include cloud, automation, and CI/CD keywords that hiring managers search for in 2026.",
    hardSkills: ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Ansible", "Jenkins", "GitHub Actions", "GitLab CI", "Linux", "Bash", "Python", "Prometheus", "Grafana", "Elasticsearch", "Kibana", "Helm", "ArgoCD", "Vault"],
    softSkills: ["Reliability engineering mindset", "Incident management", "Cross-team collaboration", "Continuous improvement", "On-call ownership", "Documentation", "Cost optimization mindset"],
    certifications: ["AWS Certified DevOps Engineer – Professional", "Certified Kubernetes Administrator (CKA)", "HashiCorp Terraform Associate", "Google Professional DevOps Engineer", "Red Hat Certified Engineer (RHCE)"],
    actionVerbs: ["Automated", "Deployed", "Architected", "Migrated", "Reduced", "Monitored", "Configured", "Provisioned", "Implemented", "Scaled", "Secured", "Optimized"],
    jobTitles: ["DevOps Engineer", "Senior DevOps Engineer", "Platform Engineer", "Site Reliability Engineer (SRE)", "Cloud Engineer", "Infrastructure Engineer", "DevSecOps Engineer"],
    industryTerms: ["CI/CD pipeline", "Infrastructure as code (IaC)", "Container orchestration", "Observability", "Service mesh", "Blue-green deployment", "Canary release", "Zero-downtime deployment", "SLOs and SLAs", "Incident response", "Chaos engineering", "GitOps", "Cloud-native"],
    tips: [
      "List the cloud provider first in your skills: 'AWS (EC2, EKS, RDS, Lambda)' — specificity by service signals real experience vs. broad claim.",
      "Include SRE-adjacent keywords (SLOs, error budgets, toil reduction) even if your title is DevOps — they are highly searched for senior roles.",
      "Quantify infrastructure impact: 'Reduced deployment time from 45 minutes to 8 minutes' and 'achieved 99.97% uptime' are strong ATS and recruiter signals.",
      "Security keywords (IAM, secrets management, vulnerability scanning) are increasingly required — include them if you have the experience.",
    ],
    faqs: [
      {
        q: "Is AWS or Kubernetes more important on a DevOps resume?",
        a: "Both are critical for most enterprise DevOps roles. AWS (or another major cloud) establishes infrastructure experience; Kubernetes demonstrates container orchestration at scale. If forced to prioritize, match whichever is listed first in the job description.",
      },
      {
        q: "What is the difference between a DevOps engineer and an SRE resume?",
        a: "DevOps resumes emphasize automation, CI/CD, and developer productivity. SRE resumes emphasize reliability engineering, SLO management, incident response, and reducing toil through software. The line is blurring — many job postings use the titles interchangeably.",
      },
      {
        q: "Should DevOps engineers list programming languages?",
        a: "Yes. Python and Bash are standard and should be listed. Go is increasingly valued for cloud-native tooling. You don't need application development depth, but scripting fluency for automation, tooling, and runbook automation is expected.",
      },
    ],
  },
  {
    slug: "marketing-manager",
    title: "Marketing Manager",
    category: "Marketing",
    description: "Key ATS keywords for marketing manager resumes. Cover campaign, analytics, and leadership terms that applicant tracking systems scan for.",
    hardSkills: ["HubSpot", "Marketo", "Salesforce", "Google Analytics", "Google Ads", "Meta Ads", "SEO", "SEM", "Email marketing", "Content marketing", "Marketing automation", "CRM", "A/B testing", "Demand generation", "Account-based marketing (ABM)", "Paid media", "Marketing attribution"],
    softSkills: ["Strategic planning", "Cross-functional leadership", "Budget management", "Stakeholder communication", "Data-driven decision making", "Creativity", "Team development", "Executive presentation"],
    certifications: ["Google Analytics Certification", "HubSpot Marketing Certification", "Meta Blueprint Certification", "Google Ads Certification", "Marketo Certified Expert", "Salesforce Marketing Cloud Certification"],
    actionVerbs: ["Launched", "Drove", "Increased", "Generated", "Optimized", "Led", "Developed", "Managed", "Created", "Executed", "Grew", "Built"],
    jobTitles: ["Marketing Manager", "Senior Marketing Manager", "Director of Marketing", "Demand Generation Manager", "Brand Manager", "Growth Marketing Manager", "Content Marketing Manager"],
    industryTerms: ["Customer acquisition cost (CAC)", "Lifetime value (LTV)", "Marketing qualified lead (MQL)", "Sales qualified lead (SQL)", "Conversion rate optimization (CRO)", "Return on ad spend (ROAS)", "Pipeline generation", "Brand awareness", "Go-to-market (GTM) strategy", "Buyer persona", "Marketing funnel", "Lead nurturing"],
    tips: [
      "Include specific platforms by name: 'HubSpot' not 'marketing automation platform' — ATS systems search for product names.",
      "Add metrics to every bullet: 'Generated 2,400 MQLs per quarter at $45 CPL' is both ATS-optimized and recruiter-compelling.",
      "Include channel-specific keywords that match the job description: B2B roles search for ABM and demand gen; B2C roles search for paid social and conversion optimization.",
      "List both the marketing activity and the business outcome: 'content strategy' + 'generated $1.2M in influenced pipeline.'",
    ],
    faqs: [
      {
        q: "What marketing keywords are most important for an ATS?",
        a: "Platform names (HubSpot, Marketo, Google Analytics), channel types (SEO, paid social, email), and metric terms (CAC, MQL, ROAS) are the most searched. Align your keywords with the specific channels and tools listed in each job description.",
      },
      {
        q: "Should a marketing manager resume include design tools?",
        a: "Include them if you use them regularly for work — Canva, Adobe Creative Suite, or Figma. However, don't overemphasize execution tools if you're applying for strategy and leadership roles, where prioritization and team management keywords carry more weight.",
      },
      {
        q: "How do I optimize a marketing resume for both B2B and B2C roles?",
        a: "Create two versions. B2B resumes should emphasize ABM, lead scoring, sales alignment, and pipeline metrics. B2C resumes should emphasize conversion optimization, paid media ROAS, brand campaigns, and customer acquisition. Mixing both equally in one resume dilutes your positioning.",
      },
    ],
  },
  {
    slug: "financial-analyst",
    title: "Financial Analyst",
    category: "Finance",
    description: "Essential ATS keywords for financial analyst resumes. Cover financial modeling, valuation, and reporting terms that hiring managers search for.",
    hardSkills: ["Financial modeling", "Excel", "DCF analysis", "Valuation", "SQL", "Power BI", "Tableau", "Bloomberg Terminal", "SAP", "Oracle Financials", "QuickBooks", "VBA", "Three-statement modeling", "Budgeting", "Forecasting", "Variance analysis"],
    softSkills: ["Analytical thinking", "Attention to detail", "Business acumen", "Executive communication", "Deadline management", "Intellectual curiosity", "Cross-functional collaboration", "Presentation skills"],
    certifications: ["CFA (Chartered Financial Analyst)", "CPA (Certified Public Accountant)", "FMVA (Financial Modeling & Valuation Analyst)", "CMA (Certified Management Accountant)", "MBA Finance concentration"],
    actionVerbs: ["Modeled", "Analyzed", "Forecasted", "Valued", "Built", "Prepared", "Presented", "Reconciled", "Identified", "Reduced", "Advised", "Evaluated"],
    jobTitles: ["Financial Analyst", "Senior Financial Analyst", "FP&A Analyst", "Investment Analyst", "Corporate Finance Analyst", "Business Finance Analyst", "Finance Manager"],
    industryTerms: ["EBITDA", "Free cash flow (FCF)", "Working capital", "Revenue recognition", "Budget vs. actual (BvA)", "Variance analysis", "Headcount planning", "P&L management", "Treasury", "Financial reporting", "Month-end close", "GAAP", "IRR and NPV"],
    tips: [
      "Excel mastery is non-negotiable — list specific functions: 'VLOOKUP, INDEX-MATCH, SUMIFS, pivot tables, Power Query, VBA macros.'",
      "Include the type of modeling you've done: 'three-statement model, LBO model, DCF, M&A model' — these are highly ATS-searchable.",
      "Mention the revenue or budget size you've modeled: 'Built financial model for $250M acquisition target' shows scale.",
      "If pursuing investment banking or PE, include deal experience with dollar amounts, even if confidential (use approximate figures).",
    ],
    faqs: [
      {
        q: "Is the CFA or CPA more important for financial analyst roles?",
        a: "It depends on the role. CFA is preferred for investment analysis, equity research, and asset management. CPA is valued for corporate finance, accounting, and audit roles. FP&A roles value either, or neither — modeling skill and business partnering experience often matter more.",
      },
      {
        q: "What Excel skills should a financial analyst list?",
        a: "VLOOKUP/XLOOKUP, INDEX-MATCH, SUMIFS, pivot tables, Power Query, and data tables for sensitivity analysis are essential. VBA and macros are a significant differentiator for roles involving large recurring models. Power BI or Tableau is increasingly expected for reporting roles.",
      },
      {
        q: "How do I show ATS keywords if my financial analysis was confidential?",
        a: "Use category and scale descriptions: 'Built DCF model for $180M acquisition target in healthcare sector' without naming the target. Focus on the technique, tool, and dollar scale — these are the ATS signals, not the company names.",
      },
    ],
  },
  {
    slug: "registered-nurse",
    title: "Registered Nurse",
    category: "Healthcare",
    description: "Key ATS keywords for registered nurse resumes. Include clinical, patient care, and certification terms that hospital ATS systems are programmed to find.",
    hardSkills: ["Patient assessment", "Medication administration", "IV therapy", "Electronic health records (EHR)", "Epic", "Cerner", "Wound care", "Vital signs monitoring", "Telemetry", "Critical care", "ACLS", "BLS", "Triage", "Clinical documentation", "Infection control", "Patient education"],
    softSkills: ["Patient advocacy", "Compassionate care", "Critical thinking under pressure", "Team coordination", "Clear communication", "Emotional resilience", "Adaptability", "Cultural competence"],
    certifications: ["Registered Nurse (RN)", "Basic Life Support (BLS)", "Advanced Cardiac Life Support (ACLS)", "Certified Emergency Nurse (CEN)", "Critical Care Registered Nurse (CCRN)", "Pediatric Advanced Life Support (PALS)"],
    actionVerbs: ["Administered", "Assessed", "Monitored", "Educated", "Collaborated", "Documented", "Implemented", "Coordinated", "Triaged", "Advocated", "Managed", "Supported"],
    jobTitles: ["Registered Nurse (RN)", "Staff Nurse", "Charge Nurse", "Clinical Nurse", "ICU Nurse", "Emergency Room Nurse", "Travel Nurse", "Float Pool Nurse"],
    industryTerms: ["Patient-to-nurse ratio", "Shift handoff", "Care planning", "Multidisciplinary team", "Evidence-based practice", "Patient satisfaction scores", "HCAHPS", "Nursing process (ADPIE)", "Scope of practice", "Joint Commission", "Magnet designation"],
    tips: [
      "List your specialty certifications prominently — CCRN, CEN, and ONC are highly ATS-searchable for specialty units.",
      "Include the specific EHR you've used — 'Epic' and 'Cerner' appear frequently in hospital ATS filters.",
      "List your patient-to-nurse ratio experience: 'Managed 5-7 patient assignments in high-acuity medical-surgical unit' shows relevant context.",
      "Include unit type and patient population clearly: 'Adult ICU,' 'pediatric oncology,' or 'labor and delivery' are specific ATS targets.",
    ],
    faqs: [
      {
        q: "What certifications should a nurse list on their resume?",
        a: "Always list your RN license with state and license number. Include BLS and ACLS as standard. Add specialty certifications (CCRN, CEN, CNOR) in the relevant unit. Include any additional certifications relevant to your specialty such as NIHSS stroke certification or IV certification.",
      },
      {
        q: "Should a nurse resume include patient satisfaction scores?",
        a: "Yes, when you have them. Hospital systems often report unit-level HCAHPS scores. Including 'unit maintained 95th percentile patient satisfaction scores' or 'received 3 DAISY Award nominations' adds credibility and differentiates clinically strong nurses.",
      },
      {
        q: "How should a travel nurse tailor their resume?",
        a: "Lead with your specialty, years of experience, and key skills. List each travel assignment as a separate position with facility name, location, unit type, and patient population. Emphasize adaptability, quick onboarding, and experience with multiple EHR systems as key differentiators.",
      },
    ],
  },
  {
    slug: "human-resources-manager",
    title: "HR Manager",
    category: "Management",
    description: "Top ATS keywords for HR manager resumes. Include talent acquisition, compliance, and people strategy terms that HR ATS systems search for.",
    hardSkills: ["Workday", "ADP", "BambooHR", "Greenhouse", "Lever", "Applicant tracking system (ATS)", "HRIS", "Compensation benchmarking", "Performance management", "Employee relations", "Benefits administration", "Payroll processing", "Onboarding", "Learning management systems (LMS)"],
    softSkills: ["Confidentiality", "Conflict resolution", "Employee advocacy", "Strategic thinking", "Empathy", "Executive communication", "Change management", "Data-driven decision making"],
    certifications: ["SHRM-CP (Certified Professional)", "SHRM-SCP (Senior Certified Professional)", "PHR (Professional in Human Resources)", "SPHR (Senior Professional in Human Resources)", "CCP (Certified Compensation Professional)"],
    actionVerbs: ["Recruited", "Implemented", "Developed", "Managed", "Reduced", "Partnered", "Led", "Designed", "Trained", "Negotiated", "Coached", "Aligned"],
    jobTitles: ["HR Manager", "Human Resources Manager", "HR Business Partner (HRBP)", "Talent Acquisition Manager", "People Operations Manager", "People Partner", "Director of People"],
    industryTerms: ["Talent acquisition", "Workforce planning", "Employee lifecycle", "Organizational development (OD)", "Total rewards", "Pay equity", "Diversity, equity & inclusion (DEI)", "Employee value proposition (EVP)", "Succession planning", "People analytics", "Culture & engagement", "EEOC compliance"],
    tips: [
      "Include HRIS platforms by exact name — 'Workday' or 'ADP Workforce Now' — these appear in keyword searches.",
      "Add compliance-related keywords: 'EEOC,' 'FMLA,' 'ADA,' 'FLSA' demonstrate legal literacy that many HR postings require.",
      "Quantify recruiting outcomes: 'Reduced time-to-fill from 45 to 28 days' and 'achieved 92% offer acceptance rate' are ATS and recruiter magnets.",
      "Include employee population size: 'supported 800-person workforce' or 'managed HR for 3,500-person multi-site organization' provides critical scale context.",
    ],
    faqs: [
      {
        q: "What is the difference between HR Manager and HRBP keywords?",
        a: "HR Manager resumes emphasize operational HR: compliance, payroll, benefits, and team management. HRBP (HR Business Partner) resumes emphasize strategic HR: workforce planning, organizational design, change management, and aligning HR strategy to business OKRs. Tailor your keyword mix based on which role profile the posting describes.",
      },
      {
        q: "Should HR resumes list recruitment metrics?",
        a: "Absolutely. Time-to-fill, cost-per-hire, offer acceptance rate, and sourcing channel mix are the most commonly sought metrics. If you've reduced turnover or improved engagement scores, include those too — they demonstrate business impact beyond transactional HR.",
      },
      {
        q: "How important is Workday experience on an HR manager resume?",
        a: "Very important for mid-size and enterprise roles. Many companies specifically filter for Workday or SAP SuccessFactors. If you've implemented an HRIS, note it explicitly — 'Led Workday implementation for 1,200-person company' is a significant differentiator.",
      },
    ],
  },
  {
    slug: "operations-manager",
    title: "Operations Manager",
    category: "Management",
    description: "Essential ATS keywords for operations manager resumes. Include process improvement, team leadership, and KPI terms that hiring managers search for.",
    hardSkills: ["Lean manufacturing", "Six Sigma", "Process improvement", "KPI management", "Supply chain", "Inventory management", "ERP systems", "SAP", "Salesforce", "Tableau", "Excel", "Budget management", "Vendor management", "Quality control", "Capacity planning"],
    softSkills: ["Cross-functional leadership", "Change management", "Problem-solving", "Strategic thinking", "Team development", "Stakeholder communication", "Decision-making under pressure", "Coaching and mentoring"],
    certifications: ["Lean Six Sigma Green Belt", "Lean Six Sigma Black Belt", "PMP (Project Management Professional)", "APICS CSCP (Supply Chain Professional)", "Certified in Production and Inventory Management (CPIM)"],
    actionVerbs: ["Streamlined", "Optimized", "Reduced", "Implemented", "Led", "Managed", "Developed", "Improved", "Launched", "Scaled", "Delivered", "Drove"],
    jobTitles: ["Operations Manager", "Senior Operations Manager", "Director of Operations", "General Manager", "Plant Manager", "Business Operations Manager", "VP of Operations"],
    industryTerms: ["Operational efficiency", "Standard operating procedures (SOPs)", "Continuous improvement (CI)", "Root cause analysis", "Capacity planning", "Key performance indicators (KPIs)", "Cost reduction", "Throughput", "COGS optimization", "Headcount planning", "Cross-functional alignment", "P&L responsibility"],
    tips: [
      "Lean Six Sigma certification (Green or Black Belt) is a high-value keyword for process-heavy operations roles — include it prominently if you have it.",
      "Include the P&L or budget size you've managed: '$15M operating budget' or '$80M plant P&L' provides critical scale context.",
      "Add industry-specific operations terms: 'warehouse management,' 'production scheduling,' 'fleet management' depending on your sector.",
      "Quantify efficiency gains specifically: 'Reduced cost per unit from $4.20 to $3.15' is more ATS-optimized and compelling than 'improved efficiency.'",
    ],
    faqs: [
      {
        q: "What operations manager keywords are most commonly ATS-filtered?",
        a: "Process improvement, KPI management, cross-functional leadership, and specific ERP systems (SAP, Oracle) are among the most commonly searched. Lean/Six Sigma methodology terms appear in manufacturing, logistics, and healthcare operations roles specifically.",
      },
      {
        q: "Should an operations manager resume mention P&L responsibility?",
        a: "Yes, if you have it. P&L ownership is a significant differentiator that filters for candidates with financial accountability. Even if your P&L scope was limited, include the dollar value: 'managed $3.2M departmental budget.'",
      },
      {
        q: "Are Lean Six Sigma keywords important for non-manufacturing operations roles?",
        a: "Yes. Lean principles have expanded into services, healthcare, logistics, and tech operations. Even if the role doesn't require certification, including process improvement methodology terms (root cause analysis, standard operating procedures, continuous improvement) resonates with hiring managers across industries.",
      },
    ],
  },
  {
    slug: "content-writer",
    title: "Content Writer",
    category: "Marketing",
    description: "Top ATS keywords for content writer resumes. Include SEO, content strategy, and publishing platform terms that editors and marketing managers search for.",
    hardSkills: ["SEO writing", "Keyword research", "WordPress", "HubSpot", "Google Analytics", "Yoast SEO", "Ahrefs", "SEMrush", "Copywriting", "Content management systems (CMS)", "AP Style", "Chicago Style", "Content strategy", "Long-form content", "Social media copy", "Email copywriting"],
    softSkills: ["Adaptable writing voice", "Research ability", "Deadline management", "Audience empathy", "Collaboration with subject matter experts", "Attention to detail", "Creative thinking", "Self-editing"],
    certifications: ["HubSpot Content Marketing Certification", "Google Analytics Certification", "Semrush Content Marketing Toolkit Certification", "Copyblogger Certified Content Marketer"],
    actionVerbs: ["Wrote", "Developed", "Researched", "Optimized", "Produced", "Managed", "Edited", "Published", "Grew", "Increased", "Created", "Launched"],
    jobTitles: ["Content Writer", "Senior Content Writer", "Content Strategist", "Copywriter", "SEO Content Writer", "Technical Writer", "Content Marketing Manager", "Blog Writer"],
    industryTerms: ["Organic traffic", "Content calendar", "Editorial calendar", "Search intent", "Topic clusters", "Pillar content", "Content distribution", "Brand voice", "Content performance", "Bounce rate", "Time on page", "Conversion rate", "B2B content", "Thought leadership"],
    tips: [
      "Include measurable organic traffic results: 'Grew organic blog traffic from 12K to 85K monthly sessions over 18 months' is a high-signal ATS and hiring manager target.",
      "List specific tools by name: 'Ahrefs,' 'SEMrush,' 'Clearscope' — content managers search for platform proficiency.",
      "Mention the content types you've mastered: long-form articles, case studies, white papers, email sequences, landing pages, video scripts — specialization filters for the right role.",
      "Include domain expertise if applicable: 'SaaS content,' 'healthcare content,' 'fintech content' — specialized knowledge commands higher rates and filters for relevant roles.",
    ],
    faqs: [
      {
        q: "Should a content writer include a portfolio link on their resume?",
        a: "Yes, always. A portfolio is often the first thing hiring managers check. Include a clean URL to your portfolio website or writing samples folder. If you don't have a dedicated site, use a Google Drive folder or Contently profile. Without samples, your resume won't advance regardless of keywords.",
      },
      {
        q: "Is SEO knowledge required for content writer roles?",
        a: "For most digital marketing and publishing roles, yes. SEO fundamentals — keyword research, search intent matching, on-page optimization — are expected. Candidates who can write compelling content that also ranks will always be preferred over those with only one skill.",
      },
      {
        q: "What metrics should a content writer include on their resume?",
        a: "Organic traffic growth, keyword rankings achieved, email open and click rates for email copy, conversion rates for landing pages, and word count volume managed. If you've contributed to revenue through content (influenced pipeline, eBook downloads driving demos), include that too.",
      },
    ],
  },
  {
    slug: "accountant",
    title: "Accountant",
    category: "Finance",
    description: "Key ATS keywords for accountant resumes. Include GAAP, software, and audit terms that corporate and public accounting ATS systems search for.",
    hardSkills: ["GAAP", "Financial reporting", "Month-end close", "QuickBooks", "SAP", "Oracle Financials", "NetSuite", "Excel", "Accounts payable (AP)", "Accounts receivable (AR)", "General ledger (GL)", "Bank reconciliation", "Tax preparation", "Fixed assets", "Payroll processing", "Audit support"],
    softSkills: ["Attention to detail", "Analytical thinking", "Deadline management", "Integrity", "Communication with non-finance stakeholders", "Problem-solving", "Organization", "Team collaboration"],
    certifications: ["CPA (Certified Public Accountant)", "CMA (Certified Management Accountant)", "EA (Enrolled Agent)", "QuickBooks ProAdvisor", "CFA Level I"],
    actionVerbs: ["Reconciled", "Prepared", "Analyzed", "Processed", "Reviewed", "Managed", "Implemented", "Streamlined", "Reduced", "Supported", "Filed", "Audited"],
    jobTitles: ["Accountant", "Senior Accountant", "Staff Accountant", "General Ledger Accountant", "Tax Accountant", "Cost Accountant", "Accounting Manager", "Controller"],
    industryTerms: ["Month-end close", "Year-end close", "Journal entries", "Trial balance", "Balance sheet reconciliation", "Financial statements", "Intercompany transactions", "Accruals and deferrals", "GAAP compliance", "SOX compliance", "Internal controls", "Audit readiness"],
    tips: [
      "Include the accounting software by exact name: 'NetSuite,' 'QuickBooks Online,' 'SAP S/4HANA' — these are ATS-filtered frequently.",
      "Specify the close cycle speed: 'Reduced month-end close from 12 to 6 business days' is a high-signal operational improvement metric.",
      "CPA credential placement matters — list it prominently after your name and in the certifications section: 'Jane Smith, CPA.'",
      "Include compliance keywords relevant to your industry: 'SOX compliance,' 'GAAP,' 'ASC 606 revenue recognition' — these signal domain expertise.",
    ],
    faqs: [
      {
        q: "Is CPA required to be called an accountant?",
        a: "No. CPA is a licensed credential required for certain public accounting services (audit sign-off, tax representation). Many excellent accountants in corporate finance, FP&A, and industry accounting don't hold CPA licenses. However, CPA is consistently the most ATS-searched accounting credential.",
      },
      {
        q: "What accounting software keywords are most important?",
        a: "QuickBooks (for SMB roles), SAP and Oracle (for enterprise roles), NetSuite (for mid-market and tech companies), and Sage are the most commonly searched. Always list the specific version or product when possible: 'QuickBooks Online' vs. 'QuickBooks Desktop' are different tools.",
      },
      {
        q: "Should accounting resumes emphasize accuracy or efficiency?",
        a: "Both, with context. Accuracy keywords (error rate reduction, reconciliation, audit-clean close) signal reliability. Efficiency keywords (close cycle improvement, automation, process streamlining) signal growth potential. Balance both in your bullets to appeal to roles at different company stages.",
      },
    ],
  },
  {
    slug: "ux-designer",
    title: "UX Designer",
    category: "Design",
    description: "Essential ATS keywords for UX designer resumes. Cover design tools, research methods, and process terms that product and design hiring managers search for.",
    hardSkills: ["Figma", "Sketch", "Adobe XD", "Invision", "Miro", "Principle", "Prototyping", "Wireframing", "User research", "Usability testing", "Information architecture", "Interaction design", "Design systems", "Accessibility (WCAG)", "User journey mapping", "Card sorting"],
    softSkills: ["Empathy", "Systems thinking", "Cross-functional collaboration", "Storytelling", "Constructive critique", "Curiosity", "Adaptability", "Simplification"],
    certifications: ["Google UX Design Certificate", "Nielsen Norman Group UX Certification", "Interaction Design Foundation Certificate", "Human Factors International Certified Usability Analyst (CUA)"],
    actionVerbs: ["Designed", "Prototyped", "Researched", "Tested", "Facilitated", "Collaborated", "Mapped", "Defined", "Improved", "Reduced", "Launched", "Validated"],
    jobTitles: ["UX Designer", "Senior UX Designer", "Product Designer", "UX/UI Designer", "Interaction Designer", "User Experience Researcher", "Lead UX Designer"],
    industryTerms: ["Double diamond process", "Design thinking", "Human-centered design", "Jobs-to-be-done (JTBD)", "User stories", "Persona development", "Heuristic evaluation", "Usability benchmark", "Design sprint", "Atomic design", "Design handoff", "Accessibility audit"],
    tips: [
      "List Figma prominently — it has become the ATS-searched tool for nearly all UX roles and its absence is noted by ATS and recruiters.",
      "Include research method keywords: 'moderated usability testing,' 'card sorting,' 'contextual inquiry' signal UX research capability beyond visual design.",
      "Mention the stage of the design process you specialize in: early discovery, rapid prototyping, or high-fidelity UI — specialization helps ATS matching.",
      "Include accessibility keywords: 'WCAG 2.1,' 'screen reader testing,' 'accessibility audit' — these are increasingly required and searched.",
    ],
    faqs: [
      {
        q: "Is Figma required to list on a UX designer resume?",
        a: "For most digital product design roles, yes. Figma has become the industry standard, and most job postings list it as a requirement. Include Sketch and Adobe XD as secondary tools if you're proficient, but Figma should appear first.",
      },
      {
        q: "What is the difference between a UX designer and a product designer?",
        a: "UX designer is traditionally research and experience flow focused. Product designer is a broader role that often encompasses UX, visual design, and cross-functional product strategy. Many companies use the titles interchangeably. When in doubt, mirror the job posting's terminology.",
      },
      {
        q: "Should UX designers list visual design tools on their resume?",
        a: "Yes if they're relevant. Figma covers most UI work now. Adobe Illustrator and Photoshop are relevant for brand-heavy or marketing design adjacent roles. After Effects for motion design. Lottie for animation in product contexts. Only list tools you can demonstrate proficiency in.",
      },
    ],
  },
  {
    slug: "sales-representative",
    title: "Sales Representative",
    category: "Sales",
    description: "Top ATS keywords for sales representative resumes. Include CRM, methodology, and quota terms that sales managers search for in 2026.",
    hardSkills: ["Salesforce CRM", "HubSpot CRM", "Outreach", "SalesLoft", "LinkedIn Sales Navigator", "ZoomInfo", "Cold calling", "Email prospecting", "Pipeline management", "Quota attainment", "Contract negotiation", "Product demonstrations", "CRM hygiene"],
    softSkills: ["Active listening", "Resilience", "Persuasion", "Relationship building", "Coachability", "Time management", "Competitive drive", "Empathy"],
    certifications: ["Salesforce Sales Representative Certification", "HubSpot Sales Certification", "Challenger Sales Training", "MEDDIC/MEDDPICC Training", "Sandler Sales Training Certification"],
    actionVerbs: ["Exceeded", "Grew", "Closed", "Prospected", "Generated", "Built", "Negotiated", "Managed", "Developed", "Converted", "Achieved", "Drove"],
    jobTitles: ["Sales Representative", "Account Executive", "Sales Development Representative (SDR)", "Business Development Representative (BDR)", "Enterprise Account Executive", "Mid-Market AE", "Inside Sales Representative"],
    industryTerms: ["Quota attainment", "Pipeline coverage", "Average contract value (ACV)", "Annual recurring revenue (ARR)", "Sales cycle", "MEDDIC", "BANT", "Solution selling", "Challenger Sale", "Multi-threading", "Champion development", "Win rate", "Prospecting cadence"],
    tips: [
      "Lead every bullet with quota attainment: '127% of quota Q3 2025' or 'Top 5 of 42 AEs in annual revenue' — this is the first filter sales managers apply.",
      "Include your average deal size and sales cycle length — these distinguish you from reps working a completely different market.",
      "List your primary CRM prominently: 'Salesforce' beats 'CRM software' in ATS keyword matching.",
      "Show your sales methodology: 'MEDDIC,' 'Challenger Sale,' or 'Sandler' — these are increasingly ATS-searched for mid-market and enterprise roles.",
    ],
    faqs: [
      {
        q: "What quota metrics should a sales rep include on their resume?",
        a: "Quota attainment percentage, rank among peers (e.g., 'top 10% of sales team'), total ARR or ACV closed, average deal size, and sales cycle length. Use the most recent 1-2 years of data if performance has improved.",
      },
      {
        q: "Should a sales representative list prospecting activity metrics?",
        a: "Yes for SDR/BDR roles where outbound activity is the primary job. Include calls per day, emails sent, meetings booked, and pipeline generated. For AE roles, focus on closed revenue and win rate — activity metrics matter less at the closing stage.",
      },
      {
        q: "What CRM tools should a sales representative know?",
        a: "Salesforce is the most commonly searched. HubSpot CRM is common at startups and mid-market companies. For outreach automation, Outreach.io and SalesLoft are the industry standards. LinkedIn Sales Navigator is searched for enterprise prospecting roles. List what you use daily.",
      },
    ],
  },
  {
    slug: "graphic-designer",
    title: "Graphic Designer",
    category: "Design",
    description: "Key ATS keywords for graphic designer resumes. Include design tools, output formats, and brand strategy terms that creative directors search for.",
    hardSkills: ["Adobe Illustrator", "Adobe Photoshop", "Adobe InDesign", "Adobe After Effects", "Figma", "Canva", "Typography", "Color theory", "Brand identity", "Logo design", "Print production", "Motion graphics", "Packaging design", "UI design", "Vector illustration"],
    softSkills: ["Creative problem-solving", "Brand thinking", "Attention to detail", "Client communication", "Deadline management", "Constructive critique", "Adaptability", "Collaboration"],
    certifications: ["Adobe Certified Professional (Illustrator, Photoshop, InDesign)", "Canva Pro Certification", "Google UX Design Certificate (for UI-focused designers)"],
    actionVerbs: ["Designed", "Created", "Developed", "Produced", "Illustrated", "Animated", "Rebranded", "Managed", "Delivered", "Conceptualized", "Optimized", "Directed"],
    jobTitles: ["Graphic Designer", "Senior Graphic Designer", "Brand Designer", "Visual Designer", "Art Director", "Creative Director", "Motion Designer", "Digital Designer"],
    industryTerms: ["Brand identity", "Style guide", "Design system", "Visual hierarchy", "Grid system", "CMYK/RGB/PMS", "Print specs", "Bleed and trim", "Asset management", "Creative brief", "Design iteration", "Art direction"],
    tips: [
      "List Adobe Creative Suite tools individually — many ATS systems search for 'Adobe Illustrator' separately from 'Adobe Photoshop.'",
      "Include output formats: 'print production,' 'digital assets,' 'social media graphics,' 'video and motion' — specialization helps ATS matching.",
      "Mention the brand scale you've worked with: 'maintained brand consistency across 200+ assets' or 'designed for Fortune 500 clients' adds credibility.",
      "Include file type keywords when relevant: 'vector graphics,' 'responsive assets,' 'SVG,' 'motion design' — these are searchable for specific role types.",
    ],
    faqs: [
      {
        q: "Should graphic designers list Canva on their resume?",
        a: "List it if you use it professionally for rapid content production or client delivery. However, Canva alone as your primary design tool signals limited technical depth. Pair it with professional tools (Illustrator, InDesign) to demonstrate full creative capability.",
      },
      {
        q: "Do graphic designers need to know HTML/CSS?",
        a: "Not required, but it's a differentiator for web and digital roles. Knowing enough HTML/CSS to hand off designs cleanly and understand browser rendering constraints makes you more valuable in digital product and web agency environments.",
      },
      {
        q: "What portfolio format is best for a graphic designer resume?",
        a: "A dedicated portfolio website (Behance, Dribbble, or a personal domain) linked directly from your resume header. For print-heavy roles, a PDF portfolio is also common. Ensure your portfolio URL is simple and clickable. The work speaks louder than the resume.",
      },
    ],
  },
  {
    slug: "cybersecurity-analyst",
    title: "Cybersecurity Analyst",
    category: "Technology",
    description: "Critical ATS keywords for cybersecurity analyst resumes. Include threat detection, compliance, and security tooling terms that InfoSec managers search for.",
    hardSkills: ["SIEM (Splunk, IBM QRadar)", "Intrusion detection systems (IDS/IPS)", "Vulnerability scanning (Nessus, Qualys)", "Penetration testing", "Incident response", "Network security", "Firewall management", "Endpoint detection (CrowdStrike, SentinelOne)", "Python scripting", "OSINT", "Digital forensics", "Threat intelligence", "Cloud security (AWS, Azure)"],
    softSkills: ["Analytical mindset", "Detail orientation", "Calm under pressure", "Threat-hunting curiosity", "Documentation", "Cross-team communication", "Ethical judgment", "Continuous learning"],
    certifications: ["CompTIA Security+", "CompTIA CySA+", "Certified Ethical Hacker (CEH)", "Certified Information Systems Security Professional (CISSP)", "GIAC Security Essentials (GSEC)", "AWS Security Specialty"],
    actionVerbs: ["Detected", "Investigated", "Mitigated", "Monitored", "Implemented", "Analyzed", "Responded", "Remediated", "Hardened", "Documented", "Conducted", "Assessed"],
    jobTitles: ["Cybersecurity Analyst", "Information Security Analyst", "SOC Analyst", "Security Operations Center (SOC) Analyst", "Threat Analyst", "Incident Responder", "Penetration Tester", "Security Engineer"],
    industryTerms: ["Threat hunting", "Indicators of compromise (IOCs)", "MITRE ATT&CK framework", "Zero-day vulnerability", "Phishing simulation", "Patch management", "Security posture", "Risk assessment", "Compliance (SOC 2, HIPAA, PCI-DSS, ISO 27001)", "Attack surface management", "NIST framework", "Security awareness training"],
    tips: [
      "List your SIEM platform specifically: 'Splunk ES' or 'IBM QRadar' — these are searched individually by security managers.",
      "Include compliance frameworks relevant to your industry: 'SOC 2 Type II,' 'HIPAA,' 'PCI-DSS' — these are mandatory keyword matches for regulated industries.",
      "MITRE ATT&CK knowledge is increasingly a required ATS keyword for SOC and threat hunting roles — include it explicitly.",
      "CompTIA Security+ is the most searched entry-level security certification. CISSP is the most searched senior certification. Match to your level.",
    ],
    faqs: [
      {
        q: "What certifications are most important for cybersecurity analysts?",
        a: "CompTIA Security+ for entry-level roles, CompTIA CySA+ or CEH for mid-level, and CISSP or CISM for senior roles. GIAC certifications (GCIH, GSEC, GPEN) are highly respected in technical security communities. Cloud-specific security certifications (AWS Security Specialty, CCSP) are increasingly searched for cloud-heavy environments.",
      },
      {
        q: "Should cybersecurity analysts list programming languages?",
        a: "Yes. Python for scripting and automation is nearly universally expected. PowerShell for Windows environments is common. Bash for Linux. More advanced roles may require C, C++, or Go for exploit development or security tool building. List based on actual proficiency.",
      },
      {
        q: "How do I list penetration testing experience on a resume?",
        a: "Include the methodology used (OWASP, PTES, MITRE ATT&CK), the scope (web application, network, social engineering), any bug bounty program participation with findings, and certifications like CEH or OSCP. Be specific but avoid details that reveal sensitive client information.",
      },
    ],
  },
  {
    slug: "machine-learning-engineer",
    title: "Machine Learning Engineer",
    category: "Technology",
    description: "Top ATS keywords for machine learning engineer resumes. Cover ML frameworks, MLOps, and production deployment terms that tech companies search for.",
    hardSkills: ["Python", "PyTorch", "TensorFlow", "Keras", "scikit-learn", "MLflow", "Kubeflow", "Apache Spark", "SQL", "Docker", "Kubernetes", "AWS SageMaker", "GCP Vertex AI", "Azure ML", "Feature engineering", "Model deployment", "REST API", "Data pipelines", "A/B testing", "Ray"],
    softSkills: ["Research mindset", "Systems thinking", "Cross-functional collaboration", "Technical communication", "Continuous learning", "Problem decomposition", "Attention to detail"],
    certifications: ["AWS Certified Machine Learning Specialty", "Google Professional Machine Learning Engineer", "TensorFlow Developer Certificate", "Databricks Machine Learning Professional", "Deep Learning Specialization (Coursera)"],
    actionVerbs: ["Built", "Trained", "Deployed", "Optimized", "Designed", "Implemented", "Reduced", "Scaled", "Automated", "Developed", "Monitored", "Evaluated"],
    jobTitles: ["Machine Learning Engineer", "Senior ML Engineer", "Applied ML Engineer", "ML Platform Engineer", "AI Engineer", "Deep Learning Engineer", "MLOps Engineer"],
    industryTerms: ["MLOps", "Model serving", "Feature store", "Experiment tracking", "Model registry", "Data drift monitoring", "Online inference", "Batch inference", "Embedding models", "LLM fine-tuning", "Retrieval-augmented generation (RAG)", "Model compression", "Shadow deployment"],
    tips: [
      "Include specific model types and architectures: 'transformer models,' 'convolutional neural networks,' 'gradient boosting' — these are directly ATS-searched.",
      "MLOps keywords are increasingly required: 'model monitoring,' 'data drift detection,' 'CI/CD for ML' — include them if you have experience.",
      "Quantify production model impact: 'Serving 50M daily predictions at <100ms latency' or 'Reduced model training time by 65%' are high-value metrics.",
      "LLM and generative AI experience is now a highly searched differentiator — include fine-tuning, RAG, or prompt engineering if applicable.",
    ],
    faqs: [
      {
        q: "What is the difference between a data scientist and ML engineer resume?",
        a: "ML engineer resumes emphasize production engineering: model deployment pipelines, serving infrastructure, MLOps practices, and latency/throughput optimization. Data scientist resumes emphasize statistical analysis, model development, and business insight generation. If you build systems that serve predictions in production, lean into ML engineer keywords.",
      },
      {
        q: "Should ML engineers list cloud platform keywords?",
        a: "Yes. AWS SageMaker, GCP Vertex AI, and Azure ML are the three most searched ML platform keywords. Employers often ATS-filter for the specific cloud their infrastructure runs on. Include your primary cloud platform prominently.",
      },
      {
        q: "Is LLM experience important on an ML engineer resume in 2026?",
        a: "Very much so. Fine-tuning LLMs, building RAG systems, implementing prompt engineering pipelines, and deploying LLM-powered products are highly searched keywords across virtually every ML-adjacent job posting in 2026. Include specific models you've worked with: 'Llama 3,' 'GPT-4,' 'Gemini.'",
      },
    ],
  },
  {
    slug: "cloud-engineer",
    title: "Cloud Engineer",
    category: "Technology",
    description: "Key ATS keywords for cloud engineer resumes. Include cloud platforms, infrastructure, and automation terms that engineering managers search for in 2026.",
    hardSkills: ["AWS", "Azure", "GCP", "Terraform", "CloudFormation", "Pulumi", "Docker", "Kubernetes", "Helm", "Linux", "Python", "Bash", "VPC networking", "IAM", "Load balancing", "Auto-scaling", "Serverless (Lambda, Cloud Functions)", "CDN", "RDS", "S3"],
    softSkills: ["Architecture thinking", "Cost optimization mindset", "Documentation", "Cross-team collaboration", "Security-first approach", "Continuous learning", "On-call ownership"],
    certifications: ["AWS Certified Solutions Architect – Associate", "AWS Certified Solutions Architect – Professional", "Google Professional Cloud Architect", "Microsoft Azure Solutions Architect Expert", "HashiCorp Terraform Associate"],
    actionVerbs: ["Architected", "Deployed", "Migrated", "Provisioned", "Automated", "Optimized", "Reduced", "Configured", "Implemented", "Managed", "Designed", "Secured"],
    jobTitles: ["Cloud Engineer", "Senior Cloud Engineer", "Cloud Architect", "Cloud Infrastructure Engineer", "Solutions Architect", "Platform Engineer", "Cloud Platform Engineer"],
    industryTerms: ["Infrastructure as code (IaC)", "Cloud-native architecture", "Multi-cloud strategy", "Hybrid cloud", "Cost optimization (FinOps)", "High availability", "Disaster recovery", "Security best practices", "Compliance (SOC 2, FedRAMP)", "Observability", "Service mesh", "Serverless architecture"],
    tips: [
      "List your primary cloud provider prominently and include specific services: 'AWS (EC2, EKS, RDS, Lambda, CloudFront, S3)' — ATS systems search at the service level.",
      "FinOps and cloud cost optimization are increasingly searched keywords — include cost savings if you've achieved them: 'Reduced monthly AWS spend by $45K.'",
      "Infrastructure as code tools are mandatory for modern cloud roles: list both 'Terraform' and 'CloudFormation' if you use both.",
      "Multi-cloud experience is a differentiator — if you've worked across AWS and Azure or GCP, make it explicit.",
    ],
    faqs: [
      {
        q: "Which cloud certification is most valuable on a resume?",
        a: "AWS Solutions Architect Associate is the most widely searched cloud certification globally. For Azure-heavy organizations, the AZ-104 Administrator or AZ-305 Architect is preferred. Google Cloud Professional Cloud Architect is valued at GCP-first companies. Match your certification to the company's cloud provider when possible.",
      },
      {
        q: "Should cloud engineers list programming languages?",
        a: "Yes. Python and Bash for scripting and automation are expected. Go is increasingly common for cloud tooling. The depth required is infrastructure automation rather than application development — focus on scripting, SDK use, and API integration.",
      },
      {
        q: "What is the difference between a cloud engineer and a DevOps engineer?",
        a: "Cloud engineers focus primarily on cloud infrastructure design, provisioning, and management. DevOps engineers focus more broadly on the development pipeline, CI/CD, and bridging development and operations. The roles overlap significantly — many companies use the titles interchangeably, so match your resume to the specific job description's emphasis.",
      },
    ],
  },
  {
    slug: "qa-engineer",
    title: "QA Engineer",
    category: "Technology",
    description: "Top ATS keywords for QA engineer resumes. Include testing frameworks, automation tools, and SDLC terms that engineering managers search for.",
    hardSkills: ["Selenium", "Playwright", "Cypress", "Appium", "JUnit", "TestNG", "Postman", "REST API testing", "SQL", "Python", "Java", "JavaScript", "JIRA", "TestRail", "Jenkins", "Git", "Performance testing (JMeter)", "Security testing", "Mobile testing"],
    softSkills: ["Detail orientation", "Analytical thinking", "Defect advocacy", "Cross-functional collaboration", "Risk-based thinking", "Communication", "Systematic approach", "Continuous improvement mindset"],
    certifications: ["ISTQB Certified Tester Foundation Level", "ISTQB Advanced Test Automation Engineer", "Selenium WebDriver certification", "AWS Certified Developer (for cloud testing)", "Certified Agile Tester (CAT)"],
    actionVerbs: ["Automated", "Tested", "Developed", "Implemented", "Reduced", "Designed", "Maintained", "Improved", "Executed", "Identified", "Prevented", "Validated"],
    jobTitles: ["QA Engineer", "Senior QA Engineer", "Software Development Engineer in Test (SDET)", "Test Automation Engineer", "QA Lead", "Quality Assurance Analyst", "Performance Test Engineer"],
    industryTerms: ["Test automation framework", "CI/CD integration", "Test coverage", "Regression testing", "Smoke testing", "End-to-end testing", "Unit testing", "Integration testing", "Performance testing", "Load testing", "Bug lifecycle", "Shift-left testing", "BDD (Behavior-Driven Development)", "TDD"],
    tips: [
      "Include the specific test framework: 'Selenium WebDriver' or 'Playwright' — ATS systems distinguish between them.",
      "Quantify testing outcomes: 'Increased automated test coverage from 35% to 78%' and 'Reduced regression cycle from 3 days to 4 hours' are high-signal metrics.",
      "SDET roles require stronger coding keywords — include your primary language (Python, Java, JavaScript) and framework depth.",
      "Include CI/CD integration keywords: 'Jenkins,' 'GitHub Actions,' 'GitLab CI' — modern QA is inseparable from the deployment pipeline.",
    ],
    faqs: [
      {
        q: "What is the difference between a QA Engineer and an SDET?",
        a: "A QA Engineer focuses on testing strategy, test case design, defect identification, and quality advocacy. An SDET (Software Development Engineer in Test) writes production-quality test automation code and may contribute to the CI/CD pipeline as a software engineer. SDET roles require stronger coding skills and are compensated closer to software engineer levels.",
      },
      {
        q: "Is manual testing experience worth listing on a QA resume?",
        a: "Yes for entry-level roles and roles where exploratory testing is valued. For senior roles with automation focus, manual testing should be listed but automation experience should lead. Companies increasingly prefer candidates who can both design test strategies and automate their execution.",
      },
      {
        q: "What programming language is most important for QA engineers?",
        a: "Python and JavaScript are the most widely used for test automation. Java is common in enterprise environments using Selenium TestNG or JUnit. Match the language to the job posting. Typescript/Playwright is rapidly growing in popularity for web UI automation.",
      },
    ],
  },
  {
    slug: "supply-chain-manager",
    title: "Supply Chain Manager",
    category: "Operations",
    description: "Essential ATS keywords for supply chain manager resumes. Include logistics, procurement, and ERP terms that operations and supply chain hiring managers search for.",
    hardSkills: ["SAP SCM", "Oracle SCM", "Demand planning", "Inventory management", "S&OP (Sales and Operations Planning)", "Procurement", "Vendor management", "Logistics coordination", "Warehouse management systems (WMS)", "Transportation management systems (TMS)", "Excel", "SQL", "Power BI", "INCOTERMS", "ERP systems"],
    softSkills: ["Analytical thinking", "Negotiation", "Cross-functional collaboration", "Risk management", "Supplier relationship management", "Stakeholder communication", "Adaptability", "Problem-solving under pressure"],
    certifications: ["APICS CSCP (Certified Supply Chain Professional)", "APICS CPIM (Certified in Production and Inventory Management)", "SCPro (CSCMP)", "Lean Six Sigma Green Belt", "PMP (Project Management Professional)"],
    actionVerbs: ["Optimized", "Reduced", "Managed", "Negotiated", "Implemented", "Streamlined", "Coordinated", "Sourced", "Monitored", "Developed", "Mitigated", "Analyzed"],
    jobTitles: ["Supply Chain Manager", "Senior Supply Chain Manager", "Director of Supply Chain", "Procurement Manager", "Logistics Manager", "Operations Manager", "Supply Chain Analyst"],
    industryTerms: ["End-to-end supply chain", "Demand forecasting", "Safety stock", "Lead time reduction", "Supplier diversification", "Total cost of ownership (TCO)", "On-time delivery (OTD)", "Fill rate", "Inventory turnover", "Last-mile logistics", "Reverse logistics", "Customs clearance", "Carbon footprint"],
    tips: [
      "Include your ERP system by exact name: 'SAP S/4HANA,' 'Oracle Cloud SCM' — hiring managers search for specific systems.",
      "Quantify supply chain impact: 'Reduced inventory carrying costs by $2.1M' and 'Improved on-time delivery from 82% to 97%' are exactly what ATS and hiring managers scan for.",
      "APICS certifications (CSCP, CPIM) are the most searched supply chain credentials — list them prominently.",
      "Include global supply chain keywords if relevant: 'international logistics,' 'customs,' 'INCOTERMS,' 'multi-region supplier management.'",
    ],
    faqs: [
      {
        q: "What supply chain certifications are most valued by employers?",
        a: "APICS CSCP is the most widely recognized for supply chain strategy and end-to-end management. APICS CPIM is preferred for production and inventory management roles. CSCMP's SCPro is valued at senior levels. Lean Six Sigma adds significant credibility for process improvement roles.",
      },
      {
        q: "Should supply chain managers include sustainability keywords?",
        a: "Yes, increasingly so. Sustainable sourcing, carbon footprint reduction, circular supply chain, and ESG supply chain compliance are growing ATS-searched terms, particularly at large consumer goods, retail, and manufacturing companies with public sustainability commitments.",
      },
      {
        q: "What financial metrics should a supply chain manager include?",
        a: "Inventory carrying cost reduction, COGS as a percentage of revenue, cost per unit shipped, total cost of ownership (TCO) savings, and procurement savings are the most relevant. Revenue-impacting metrics like fill rate improvement and stockout reduction are also valued.",
      },
    ],
  },
  {
    slug: "social-media-manager",
    title: "Social Media Manager",
    category: "Marketing",
    description: "Top ATS keywords for social media manager resumes. Include platform, analytics, and content strategy terms that marketing managers search for.",
    hardSkills: ["Instagram", "LinkedIn", "TikTok", "X (Twitter)", "Facebook", "Pinterest", "YouTube", "Hootsuite", "Sprout Social", "Buffer", "Canva", "Adobe Creative Suite", "Google Analytics", "Meta Business Suite", "Social media analytics", "Content calendar management", "Community management"],
    softSkills: ["Brand voice consistency", "Community building", "Creative storytelling", "Trend awareness", "Crisis communication", "Collaboration", "Adaptability", "Analytical thinking"],
    certifications: ["Meta Blueprint Certification", "Hootsuite Social Marketing Certification", "Sprout Social Education Certification", "Google Analytics Certification", "HubSpot Social Media Certification"],
    actionVerbs: ["Grew", "Launched", "Created", "Managed", "Increased", "Developed", "Produced", "Analyzed", "Optimized", "Engaged", "Built", "Executed"],
    jobTitles: ["Social Media Manager", "Senior Social Media Manager", "Social Media Strategist", "Community Manager", "Content Manager", "Digital Marketing Manager", "Social Media Specialist"],
    industryTerms: ["Content strategy", "Editorial calendar", "Engagement rate", "Organic reach", "Paid social", "Influencer marketing", "UGC (user-generated content)", "Community management", "Brand voice", "Social listening", "Viral content", "Story and Reel formats", "Platform algorithm"],
    tips: [
      "List specific platforms — Instagram, TikTok, LinkedIn — not just 'social media platforms.' ATS systems filter for platform-specific experience.",
      "Include follower or community growth metrics: 'Grew LinkedIn following from 12K to 89K in 18 months' is the single most compelling social media metric.",
      "Add engagement rate benchmarks: 'Maintained 4.2% engagement rate across Instagram (3x industry average)' differentiates active community building from passive posting.",
      "Include video and short-form content keywords: 'Reels,' 'TikTok,' 'YouTube Shorts' — short-form video expertise is highly searched.",
    ],
    faqs: [
      {
        q: "What metrics should a social media manager list on their resume?",
        a: "Follower growth (absolute and percentage), engagement rate (likes + comments + shares / reach), reach and impressions, website traffic from social, and conversion rates for paid campaigns. Community size and growth trajectory are the most consistently impressive metrics.",
      },
      {
        q: "Should social media managers include paid advertising keywords?",
        a: "Yes, if you manage paid social. Paid social (Meta Ads, LinkedIn Ads, TikTok Ads) is a distinct and highly valued skill set. Include the platforms, your ROAS or CPL benchmarks, and monthly ad spend managed. Paid + organic expertise is more valuable than organic alone.",
      },
      {
        q: "What's the difference between a social media manager and content manager?",
        a: "Social media managers focus specifically on platform management, community engagement, and social-specific content. Content managers have a broader scope: blog, email, SEO content, and sometimes social. If the role spans beyond social platforms, content manager keywords (editorial calendar, SEO content, CMS) become important additions.",
      },
    ],
  },
  {
    slug: "full-stack-developer",
    title: "Full Stack Developer",
    category: "Technology",
    description: "Key ATS keywords for full stack developer resumes. Cover frontend, backend, database, and deployment terms that tech hiring managers search for in 2026.",
    hardSkills: ["JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "Node.js", "Express", "Python", "Django", "FastAPI", "PostgreSQL", "MongoDB", "MySQL", "Redis", "REST API", "GraphQL", "AWS", "Docker", "Git", "Tailwind CSS"],
    softSkills: ["End-to-end ownership", "Product thinking", "Cross-functional collaboration", "Code review", "Self-direction", "Technical communication", "Problem-solving", "Agile adaptability"],
    certifications: ["AWS Certified Developer Associate", "MongoDB Certified Developer", "Google Associate Cloud Engineer", "Meta Front-End Developer Professional Certificate"],
    actionVerbs: ["Built", "Developed", "Designed", "Implemented", "Deployed", "Optimized", "Architected", "Maintained", "Shipped", "Integrated", "Refactored", "Scaled"],
    jobTitles: ["Full Stack Developer", "Full Stack Engineer", "Software Engineer (Full Stack)", "Web Developer", "Senior Full Stack Developer", "Lead Full Stack Engineer"],
    industryTerms: ["End-to-end development", "Frontend architecture", "Backend services", "API design", "Database schema design", "Monorepo", "Microservices", "Serverless", "PWA (Progressive Web App)", "SEO-optimized development", "Web performance", "Responsive design"],
    tips: [
      "List both frontend and backend technologies explicitly — 'React (frontend) + Node.js/PostgreSQL (backend)' shows full-stack depth clearly.",
      "Next.js is a highly searched keyword for modern full-stack roles — include it if you have experience with it.",
      "Include deployment and DevOps experience: 'Docker,' 'AWS EC2/S3,' 'Vercel,' 'CI/CD' — full stack developers who own deployment are more valued.",
      "Quantify application scale: '100K monthly active users,' '10M API requests per day' — this context differentiates production experience from tutorial projects.",
    ],
    faqs: [
      {
        q: "What is the most in-demand full stack technology stack in 2026?",
        a: "The most searched combinations include: React + Node.js + PostgreSQL (JavaScript full stack), Next.js + TypeScript + PostgreSQL (modern SSR stack), and Python (Django/FastAPI) + React + PostgreSQL. The MERN stack (MongoDB, Express, React, Node) is still widely used but PostgreSQL is increasingly preferred over MongoDB.",
      },
      {
        q: "Should a full stack developer specialize or stay generalist?",
        a: "Specialize within full stack. Being 'full stack' means you can handle both ends, but employers still want depth. Lead with your strongest side (frontend or backend) and show competency on the other. Trying to be equally expert at everything often results in being average at both.",
      },
      {
        q: "How should a full stack developer present personal projects?",
        a: "Include a GitHub link and for each project: the tech stack used, the problem it solves, the scale or usage if live, and any interesting technical challenges solved. Projects with real users or business utility demonstrate production-level thinking rather than tutorial completion.",
      },
    ],
  },
  {
    slug: "healthcare-administrator",
    title: "Healthcare Administrator",
    category: "Healthcare",
    description: "Essential ATS keywords for healthcare administrator resumes. Include compliance, operations, and healthcare management terms that hospital systems search for.",
    hardSkills: ["Epic EHR", "Cerner", "Healthcare operations", "Revenue cycle management", "Budget management", "HIPAA compliance", "Joint Commission standards", "Quality improvement", "Staff scheduling", "Healthcare analytics", "Patient experience metrics", "Credentialing", "Contract management"],
    softSkills: ["Leadership", "Strategic planning", "Stakeholder management", "Change management", "Communication", "Problem-solving", "Financial acumen", "Team development"],
    certifications: ["Fellow of the American College of Healthcare Executives (FACHE)", "Certified Healthcare Executive (CHE)", "Registered Health Information Administrator (RHIA)", "Certified Professional in Health Informatics (CPHI)", "Lean Six Sigma Green Belt"],
    actionVerbs: ["Led", "Managed", "Implemented", "Reduced", "Improved", "Developed", "Oversaw", "Negotiated", "Increased", "Streamlined", "Coordinated", "Launched"],
    jobTitles: ["Healthcare Administrator", "Hospital Administrator", "Practice Administrator", "Healthcare Operations Manager", "Director of Operations", "Chief Operating Officer (COO)", "Department Director"],
    industryTerms: ["Patient throughput", "Length of stay (LOS)", "HCAHPS scores", "Readmission rate", "Denials management", "Payer mix", "Value-based care", "Population health management", "CMS compliance", "Magnet designation", "Physician relations", "Patient safety"],
    tips: [
      "Include HCAHPS scores and patient experience metrics if you've improved them — these are directly searched by hospital hiring committees.",
      "Specify your operational scope: 'managed 350-bed acute care hospital' or 'oversaw 5 outpatient clinic locations' provides critical scale context.",
      "FACHE designation is the most widely recognized credential in healthcare administration — list it prominently if held.",
      "Include revenue cycle and financial performance keywords: 'reduced denials by 28%' and 'improved collections by $1.8M' are high-value for CFO and board visibility roles.",
    ],
    faqs: [
      {
        q: "What degree is typically required for a healthcare administrator?",
        a: "An MHA (Master of Health Administration) or MBA with a healthcare concentration is standard for director and above roles. Some organizations accept a BSN with administrative experience for department-level positions. A clinical background (nursing, pharmacy) combined with administrative experience is highly valued in clinical operations roles.",
      },
      {
        q: "What financial metrics should a healthcare administrator include?",
        a: "Operating budget managed, cost per patient day, revenue cycle metrics (days in AR, collection rate, denial rate), labor cost as percentage of net revenue, and any financial turnaround results. Specific dollar savings or revenue improvements are the strongest ATS signals.",
      },
      {
        q: "How important is EHR experience for healthcare administrator roles?",
        a: "Very important. Epic is the most widely implemented hospital EHR. Listing Epic implementation or optimization experience is a significant differentiator. Cerner, Meditech, and Allscripts experience is also valued depending on the health system's platform.",
      },
    ],
  },
]

export function getAtsKeywordsBySlug(slug: string): AtsKeywordsData | undefined {
  return atsKeywordsData.find((d) => d.slug === slug)
}
