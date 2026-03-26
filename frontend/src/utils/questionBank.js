/**
 * Static question bank organized by role → difficulty.
 * 5 questions per combination. API is only used for EVALUATION.
 */
const QUESTION_BANK = {
  "Software Engineer": {
    Beginner: [
      "What is the difference between a stack and a queue? Give a real-world example of each.",
      "Explain what Object-Oriented Programming is and name its four main principles.",
      "What is version control and why is Git important in software development?",
      "What is the difference between a compiled language and an interpreted language?",
      "Describe the difference between HTTP GET and POST requests."
    ],
    Intermediate: [
      "Explain RESTful API design principles. What makes an API truly RESTful?",
      "What is the difference between SQL and NoSQL databases? When would you choose one over the other?",
      "Describe the SOLID principles and give an example of how you've applied one in a project.",
      "How does a hash map work internally? What is a collision and how is it handled?",
      "Walk me through how you would debug a production performance issue in a web application."
    ],
    Advanced: [
      "Describe the CAP theorem and explain how you'd design a distributed system around it.",
      "How would you design a URL shortener like Bit.ly that supports 100 million requests per day?",
      "Explain event-driven architecture and when you'd prefer it over a monolithic approach.",
      "What are the trade-offs between microservices and monolith architectures? When would you use each?",
      "How do you approach technical debt in a large legacy codebase while maintaining delivery speed?"
    ]
  },

  "Product Manager": {
    Beginner: [
      "How would you describe the role of a Product Manager to someone outside the tech industry?",
      "What is the difference between a product roadmap and a product backlog?",
      "Walk me through how you would collect user feedback for a new feature.",
      "What is a user story? Write one for a basic login feature.",
      "How do you decide which features to build first? What factors do you consider?"
    ],
    Intermediate: [
      "Describe how you would prioritize a backlog using a framework like RICE or MoSCoW.",
      "Tell me about a time you had to say 'no' to a stakeholder request. How did you handle it?",
      "How do you measure the success of a product feature after launch?",
      "Walk me through how you would conduct a competitive analysis for a new product.",
      "How do you align engineering, design, and business teams around a single product goal?"
    ],
    Advanced: [
      "How would you define and track North Star Metrics for a B2B SaaS product?",
      "Describe your approach to building a product strategy from scratch for a new market.",
      "How do you handle a situation where data contradicts user qualitative feedback?",
      "Tell me about a product failure you were part of. What did you learn and how did it change your approach?",
      "How would you evaluate whether to build, buy, or partner for a new product capability?"
    ]
  },

  "Data Analyst": {
    Beginner: [
      "What is the difference between mean, median, and mode? When would you use each?",
      "Explain what a JOIN is in SQL. What are the different types of JOINs?",
      "What tools have you used for data visualization and why?",
      "What is the difference between structured and unstructured data?",
      "How would you clean a dataset that has missing values?"
    ],
    Intermediate: [
      "Walk me through how you would analyze a sudden 20% drop in website traffic.",
      "What is A/B testing and how do you determine statistical significance?",
      "Explain the difference between correlation and causation with a business example.",
      "How would you design a dashboard for a business stakeholder who is not technical?",
      "Describe how you would use cohort analysis to evaluate user retention."
    ],
    Advanced: [
      "What is the difference between supervised and unsupervised machine learning? Give a business use case for each.",
      "How would you build a churn prediction model for a subscription business?",
      "Explain how you would handle data pipeline failures in a production analytics environment.",
      "Describe your experience with time series forecasting. What models have you used?",
      "How do you ensure data quality and governance in a large organization?"
    ]
  },

  "Marketing": {
    Beginner: [
      "What is the difference between inbound and outbound marketing?",
      "Explain what SEO is and why it matters for a business.",
      "What metrics would you track for a social media marketing campaign?",
      "What is a buyer persona and how do you create one?",
      "Describe the customer journey and how marketing impacts each stage."
    ],
    Intermediate: [
      "How would you plan and execute a product launch campaign with a limited budget?",
      "Describe a time you used data to pivot a marketing strategy. What was the result?",
      "What is content marketing and how do you measure its ROI?",
      "Explain how email segmentation works and why it's effective.",
      "How would you approach building brand awareness in a new market?"
    ],
    Advanced: [
      "How do you build a full-funnel marketing strategy that aligns with revenue goals?",
      "Describe how you would use performance marketing to scale a D2C brand.",
      "How do you approach attribution modeling in a multi-channel marketing environment?",
      "Tell me about a marketing campaign that failed. What did you change?",
      "How do you stay ahead of changing platform algorithms (Google, Meta) while ensuring consistent ROI?"
    ]
  },

  "HR": {
    Beginner: [
      "What is the difference between recruitment and talent acquisition?",
      "How would you onboard a new employee effectively in their first 30 days?",
      "What are some common HR compliance requirements every company should follow?",
      "Describe what an employee performance review process typically looks like.",
      "How do you handle a confidential HR complaint from an employee?"
    ],
    Intermediate: [
      "Tell me about a time you resolved a conflict between two employees. What was your approach?",
      "How do you design a compensation and benefits package to attract top talent?",
      "What strategies do you use to reduce employee turnover?",
      "How do you measure employee engagement and what actions follow from those results?",
      "Describe your experience with succession planning and leadership development."
    ],
    Advanced: [
      "How do you align an HR strategy with overall business goals during rapid company growth?",
      "Describe how you would lead a company-wide culture transformation initiative.",
      "How do you handle workforce planning during economic downturns without destroying company culture?",
      "Tell me about a time you had to manage a large-scale organizational change. What was your approach?",
      "How do you use people analytics to drive strategic HR decisions?"
    ]
  },

  "Business Analyst": {
    Beginner: [
      "What is the difference between functional and non-functional requirements?",
      "Describe how you would document and communicate requirements to a development team.",
      "What is a use case diagram and how is it used in business analysis?",
      "What is the purpose of a stakeholder analysis and how do you perform one?",
      "Explain what a gap analysis is and when you'd use it."
    ],
    Intermediate: [
      "Walk me through how you would gather requirements for a new enterprise software project.",
      "Tell me about a project where requirements changed mid-development. How did you manage it?",
      "How do you prioritize requirements when multiple stakeholders have conflicting needs?",
      "Describe how you would write a Business Requirements Document (BRD).",
      "How do you validate that a delivered solution meets the original business requirements?"
    ],
    Advanced: [
      "How do you approach business process re-engineering for a large legacy organization?",
      "Describe a time you identified a business opportunity through data analysis. What was the outcome?",
      "How do you manage scope creep on a complex enterprise project?",
      "Tell me about a time where your analysis directly influenced a major business decision.",
      "How do you build trust and credibility with C-level stakeholders as a Business Analyst?"
    ]
  }
};

/**
 * Gets 5 questions for a given role and difficulty, shuffled randomly.
 * Falls back to Software Engineer / Intermediate if combination not found.
 *
 * @param {string} role - The job role (e.g. "Software Engineer")
 * @param {string} difficulty - The difficulty level (e.g. "Intermediate")
 * @returns {string[]} Array of 5 question strings.
 */
export function getQuestionsForRole(role, difficulty) {
  const roleBank = QUESTION_BANK[role] || QUESTION_BANK["Software Engineer"];
  const questions = roleBank[difficulty] || roleBank["Intermediate"];
  // Shuffle a copy so order is randomized each session
  return [...questions].sort(() => Math.random() - 0.5);
}

export default QUESTION_BANK;
