import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ShipWheelIcon } from 'lucide-react';
import useResetPassword from '../hooks/useResetPassword.js';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(''); // To show errors/success visually
  const { token } = useParams(); // Grab token from URL parameters
  const navigate = useNavigate();

    const {isPending, error, resetPasswordMutation} = useResetPassword();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (password.length < 6) {
        setMessage("Password must be at least 6 characters.");
        return;
    }
    if (password !== confirmPassword) {
        setMessage("Passwords do not match!");
        return;
        }

    resetPasswordMutation({ token, password });
    navigate('/login');
  };



  return (
    <div className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8" data-theme="forest">
          <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
            {/* FORGOT PASSWORD FORM SECTION */}
            <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
              {/* LOGO */}
              <div className="mb-4 flex items-center justify-start gap-2">
                <ShipWheelIcon className="size-9 text-primary"/>
                <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                  ChatApp
                </span>
              </div>
    
              {/*ERROR MESSAGE DISPLAY*/}
              {error && (
                <div className="alert alert-error mb-4">
                  <span>{error.response.data.message}</span>
                  </div>
              )}

              <div className="w-full">
                {/* Feedback Message */}
                {message && (
                    <div className="alert alert-error mb-4">
                        <span>{message}</span>
                    </div>
                )}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="flex flex-col gap-5">
                    <div>
                        <label className="text-xl font-semibold">New Password</label>
                        <input 
                            type="password" 
                            placeholder="Enter new password" 
                            className="input input-bordered w-full"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xl font-semibold">Confirm Password</label>
                        <input 
                            type="password" 
                            placeholder="Confirm new password" 
                            className="input input-bordered w-full"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required 
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-full" disabled={isPending}>
                        Update Password
                    </button>
                    </div>
                </form>
              </div>
              </div>
              {/* IMAGE SECTION */}
              <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
                <div className="max-w-md p-8">
                  {/* Illustration */}
                  <div className="relative aspect-square max-w-sm mx-auto">
                    <img src="/i.png" alt="Language connection illustration" className="w-full h-full" />
                  </div>
                  <div className="text-center space-y-3 mt-6">
                    <h2 className="text-xl font-semibold">Connect with language partners worldwide</h2>
                    <p className="opacity-70">
                      Practice conversations, make friends, and improve your language skills together
                    </p>
                  </div>
                </div>
            </div>
        </div>
        </div>
  );
};

export default ResetPassword;