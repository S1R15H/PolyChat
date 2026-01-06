import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { resetPassword } from '../lib/api.js';
import { toast } from "react-hot-toast";

const useResetPassword = () => {
    const queryClient = useQueryClient();
  const {mutate, isPending, error}= useMutation({
    mutationFn: resetPassword,
    onSuccess:() => {
      queryClient.invalidateQueries({queryKey: ["authUser"]});
      toast.success("Password has been reset successfully! You can now log in with your new password.");
    }
  });

  return { isPending, error, resetPasswordMutation:mutate};
}

export default useResetPassword