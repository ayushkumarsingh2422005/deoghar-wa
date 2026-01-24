import { hasUsers } from '../actions/auth';
import LoginForm from './LoginForm';

export default async function LoginPage() {
    const isSetupRequired = !(await hasUsers());

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-400/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-[120px]" />
            </div>

            <div className="relative z-10 w-full flex justify-center">
                <LoginForm isSetupRequired={isSetupRequired} />
            </div>
        </div>
    );
}
