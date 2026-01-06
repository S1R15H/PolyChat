import { useState } from 'react';
import { ShipWheelIcon } from "lucide-react";
import { Link } from 'react-router';
import useForgotPassword from '../hooks/useForgotPassword.js';

const ForgotPassword = () => {
  const [email, setEmail] = useState({
    email:"",
  });
  
  const {isPending, error, forgotPasswordMutation} = useForgotPassword();


  const handleSubmit = async (e) => {
    e.preventDefault();
    forgotPasswordMutation(email);
  };

  return (
    <div className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8" data-theme="forest">
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        {/* FORGOT PASSWORD FORM SECTION */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <Link to="/login" className="flex items-center justify-start gap-2">
            <ShipWheelIcon className="size-9 text-primary"/>
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              ChatApp
            </span>
            </Link>
          </div>

          {/*ERROR MESSAGE DISPLAY*/}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error.response.data.message}</span>
              </div>
          )}
          <div className="w-full">
          <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-5">
              <h2 className="text-xl font-semibold">Your Email.</h2>
              <input 
                  type="email" 
                  placeholder="hello@example.com" 
                  className="input input-bordered w-full"
                  value={email.email}
                  onChange={(e) => setEmail({ email: e.target.value })} 
                  required
              />
              <button type="submit" className="btn btn-primary w-full" disabled={isPending}>
                {isPending ? (
                  <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Sending Reset Link...
                  </>
                ):(
                  "Send Reset Link"
                )}
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

export default ForgotPassword;