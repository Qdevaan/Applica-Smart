import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  signupSchema,
  type SignupFormData,
} from "../../utils/validators/signupSchema";
import { useSignup } from "../../hooks/useSignup";
import SignUpFields from "../auth/AuthFields/SignUpFields";
import Button from "../ui/Button";
import FormError from "../ui/FormError";
import FormSuccess from "../ui/FormSuccess";
import SocialAuthButtons from "../auth/SocialAuthButtons";
import PasswordStrengthBar from "../auth/PasswordStrengthBar";

const SignUpForm = () => {
  const { signup, isLoading, error, successMessage } = useSignup();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const password = watch("password", "");

  const onSubmit = async (data: SignupFormData) => {
    try {
      await signup(data);
    } catch (err) {
      // Error is handled in the hook
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="space-y-6"
    >
      {successMessage && (
        <FormSuccess title="Almost there - check your inbox" message={successMessage} icon="mail" />
      )}
      {error && <FormError message={error} />}

      <SignUpFields register={register} errors={errors} />

      {password && <PasswordStrengthBar password={password} />}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isLoading}
      >
        Create Account
      </Button>

      <SocialAuthButtons />
    </motion.form>
  );
};

export default SignUpForm;
