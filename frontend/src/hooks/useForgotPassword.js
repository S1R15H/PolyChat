import { forgotPassword } from '../lib/api.js';
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from 'react-hot-toast';

const useForgotPassword = () => {
    const queryClient = useQueryClient();
  const {mutate, isPending, error}= useMutation({
    mutationFn: forgotPassword,
    onSuccess:() => {
        toast.success("Reset link sent! Please check your email.");
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
    }
  });

  return { isPending, error, forgotPasswordMutation:mutate};
}

export default useForgotPassword