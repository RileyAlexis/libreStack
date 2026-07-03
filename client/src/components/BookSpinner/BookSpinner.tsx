/* Attribution https://uiverse.io/profile/anand_4957 */

import "./BookSpinner.css";

interface BookSpinnerProps {
  width: string;
  height: string;
}

export const BookSpinner: React.FC = () => {
  return <span className="loader"></span>;
};
