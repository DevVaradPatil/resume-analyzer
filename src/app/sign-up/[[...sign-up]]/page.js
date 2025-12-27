import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="w-full max-w-md flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Create Account</h1>
          <p className="text-slate-600">Get started with ResumeInsight</p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 
                'bg-emerald-600 hover:bg-emerald-700 text-sm normal-case',
              card: 'shadow-xl',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton: 
                'border-slate-200 hover:bg-slate-50',
              formFieldInput: 
                'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500',
              footerActionLink: 
                'text-emerald-600 hover:text-emerald-700',
            },
          }}
        />
      </div>
    </div>
  );
}
