import React from 'react';
import { useNavigate } from 'react-router-dom';

const PLANS = [
  {
    name: "Student Starter",
    price: "Free",
    monthly: true,
    desc: "Perfect for students starting their freelance journey.",
    features: ["Apply to 3 concurrent tasks", "Standard dashboard access", "Skill verification tests", "Community support"],
    cta: "Start Earning (Free)",
    color: "from-s-high to-s-mid",
    border: "border-outline-v/30",
    popular: false,
    ring: false
  },
  {
    name: "Business PRO",
    price: "₹899",
    suffix: "/month",
    monthly: true,
    desc: "For startups needing unlimited agile student talent.",
    features: ["Post unlimited tasks", "AI Brief Generator", "Priority task visibility (⭐)", "Applicant dashboard tools", "Senior QC peer-reviews", "24/7 dedicated support"],
    cta: "Upgrade to PRO",
    color: "from-primary-dim to-primary",
    border: "border-primary/40",
    popular: true,
    ring: true
  },
  {
    name: "Student Premium",
    price: "₹199",
    suffix: "/month",
    monthly: true,
    desc: "Remove limits and fast-track your freelance growth.",
    features: ["Apply to unlimited tasks", "Featured portfolio ranking", "Early access to new tasks", "Priority senior reviews"],
    cta: "Get Student Premium",
    color: "from-secondary/80 to-sec-container",
    border: "border-secondary/30",
    popular: false,
    ring: false
  }
];

export default function PricingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-bg min-h-screen pt-12 pb-24 px-6 relative overflow-hidden">
      {/* Background Blurs */}
      <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16 animate-[fadeIn_0.5s_ease-out]">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-black uppercase tracking-widest mb-6">
            Pricing Plans
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-on-surface mb-6">
            Unleash the full power of<br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"> Skill-To-Income</span>
          </h1>
          <p className="text-on-sv text-lg font-medium max-w-2xl mx-auto">
            Choose the perfect plan to scale your student internships or find the best talent across India effortlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
          {PLANS.map((plan, i) => (
            <div 
              key={plan.name} 
              className={`relative bg-s-low rounded-[32px] p-8 transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl flex flex-col h-full
                ${plan.border} border 
                ${plan.ring ? 'scale-105 shadow-[0_20px_60px_-15px_rgba(99,102,241,0.3)] z-10' : 'scale-100 z-0'}
              `}
              style={{ animation: `slideUp 0.5s ease-out ${i * 0.15}s both` }}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary-dim to-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-on-surface mb-2">{plan.name}</h3>
                <p className="text-sm font-medium text-on-sv leading-relaxed h-10">{plan.desc}</p>
              </div>

              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-4xl font-black text-on-surface">{plan.price}</span>
                {plan.suffix && <span className="text-sm font-bold text-on-sv">{plan.suffix}</span>}
              </div>

              <div className="flex-1">
                <div className="text-xs font-black uppercase tracking-widest text-on-sv mb-6">What's included</div>
                <ul className="flex flex-col gap-4 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[18px] text-success shrink-0 font-black">check_circle</span>
                      <span className="text-sm font-semibold text-on-surface leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                className={`w-full py-4 px-6 rounded-xl font-black text-[15px] transition-all duration-200 active:scale-95
                  ${plan.ring 
                    ? 'bg-gradient-to-r from-primary-dim to-primary text-white shadow-lg hover:shadow-primary/40' 
                    : 'bg-s-mid text-on-surface hover:bg-s-high border border-outline-v/50'
                  }
                `}
                onClick={() => navigate('/register')}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center animate-[fadeIn_1s_ease-out]">
           <p className="text-on-sv font-bold text-sm">Need a custom enterprise SLA layout? <a href="mailto:support@skillearn.in" className="text-primary hover:underline">Contact Sales</a></p>
        </div>
      </div>
    </div>
  );
}
