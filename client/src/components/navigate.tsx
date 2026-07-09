import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface NavigateProps {
  to: string;
  replace?: boolean;
  state?: unknown;
  title?: string;
}

const Navigate: React.FC<NavigateProps> = ({ to, replace = false, state, title }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (title) {
      document.title = title;
    }

    navigate(to, { replace, state });
  }, [navigate, to, replace, state, title]);

  return null;
};
export const navigate = (to: string, replace = false, state?: unknown, title?: string) => {
  if (title) {
    document.title = title;
  }
    const navigate = useNavigate();
    navigate(to, { replace, state });
}
export default Navigate;
